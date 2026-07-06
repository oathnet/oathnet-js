/**
 * Tests for ScannersService - automated monitoring request construction.
 */

import { OathNetClient } from '../../src';
import { ScannersService } from '../../src/services/scanners';
import {
  ScannerCreateRequest,
  ScannerDraftTestRequest,
  ScannerUpdateRequest,
} from '../../src/types';

const assertScannerUpdateStatusIsUnsupported = (): void => {
  // @ts-expect-error Scanner state changes are handled by pause/resume.
  const request: ScannerUpdateRequest = { status: 'paused' };
  void request;
};
void assertScannerUpdateStatusIsUnsupported;

describe('ScannersService', () => {
  const createService = () => {
    const get = jest.fn();
    const post = jest.fn();
    const patch = jest.fn();
    const deleteMethod = jest.fn();
    const service = new ScannersService({
      get,
      post,
      patch,
      delete: deleteMethod,
    } as unknown as OathNetClient);

    return { deleteMethod, get, patch, post, service };
  };

  it('is exposed from the main client', () => {
    const client = new OathNetClient('test-api-key');

    expect(client.scanners).toBeDefined();
    expect(client.scanners).toBe(client.scanners);
  });

  const createRequest: ScannerCreateRequest = {
    name: 'Example breach monitor',
    scanner_type: 'breach',
    query_config: {
      filter: {
        field: 'email_domain',
        operator: 'eq',
        value: 'example.com',
      },
    },
    notification_type: 'webhook',
    webhook_url: 'https://alerts.example.com/oathnet',
    webhook_security_mode: 'signed_json',
    notify_on_zero_results: false,
  };

  const draftTestRequest: ScannerDraftTestRequest = {
    name: 'Draft breach monitor',
    scanner_type: 'breach',
    query_config: {
      email_domain: 'example.com',
    },
    notification_type: 'webhook',
    webhook_url: 'https://alerts.example.com/oathnet',
    webhook_security_mode: 'signed_encrypted',
  };

  describe('request construction', () => {
    it('gets scanner quota', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        max_scanners: 10,
        current_count: 2,
        remaining: 8,
        can_create: true,
      });

      const result = await service.getQuota();

      expect(result.remaining).toBe(8);
      expect(get).toHaveBeenCalledWith('/scanners/quota');
    });

    it('lists scanners with optional filters mapped to query params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue([]);

      await service.list({ status: 'active', scannerType: 'stealer' });

      expect(get).toHaveBeenCalledWith('/scanners', {
        status: 'active',
        scanner_type: 'stealer',
      });
    });

    it('omits undefined list filters', async () => {
      const { get, service } = createService();
      get.mockResolvedValue([]);

      await service.list({ status: 'paused' });

      expect(get).toHaveBeenCalledWith('/scanners', {
        status: 'paused',
      });
    });

    it('creates scanners with the documented request body', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({ uid: 'scanner-123' });

      await service.create(createRequest);

      expect(post).toHaveBeenCalledWith('/scanners/create', createRequest);
    });

    it('gets scanner details with encoded path params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({ uid: 'scanner/with space' });

      await service.get('scanner/with space');

      expect(get).toHaveBeenCalledWith('/scanners/scanner%2Fwith%20space');
    });

    it('updates scanners with PATCH and no status field', async () => {
      const { patch, service } = createService();
      const updateRequest: ScannerUpdateRequest = {
        name: 'Updated monitor',
        scanner_type: 'breach',
        query_config: { dbname: 'linkedin.com' },
        notification_type: 'email',
        webhook_url: null,
        notify_on_zero_results: true,
      };
      patch.mockResolvedValue({ uid: 'scanner-123' });

      await service.update('scanner-123', updateRequest);

      expect(patch).toHaveBeenCalledWith(
        '/scanners/scanner-123/update',
        updateRequest
      );
      expect(updateRequest).not.toHaveProperty('status');
    });

    it('deletes scanners with DELETE and returns no body', async () => {
      const { deleteMethod, service } = createService();
      deleteMethod.mockResolvedValue(undefined);

      const result = await service.delete('scanner-123');

      expect(result).toBeUndefined();
      expect(deleteMethod).toHaveBeenCalledWith('/scanners/scanner-123/delete');
    });

    it('tests unsaved scanner delivery and returns success false responses', async () => {
      const { post, service } = createService();
      const deliveryResult = {
        success: false,
        notification_type: 'webhook',
        target: 'https://alerts.example.com/oathnet',
        status_code: 500,
        message: 'Webhook target rejected the test notification',
      };
      post.mockResolvedValue(deliveryResult);

      await expect(service.testDelivery(draftTestRequest)).resolves.toEqual(
        deliveryResult
      );
      expect(post).toHaveBeenCalledWith(
        '/scanners/test-delivery',
        draftTestRequest
      );
    });

    it('tests existing scanner notification', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({ success: true });

      await service.testNotification('scanner-123');

      expect(post).toHaveBeenCalledWith('/scanners/scanner-123/test');
    });

    it('gets webhook security envelope', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        success: true,
        data: {
          scanner_uid: 'scanner-123',
          notification_type: 'webhook',
          webhook_security_mode: 'signed_json',
          verification_method: 'signature',
          encryption_enabled: false,
          secret_configured: true,
          secret_preview: null,
          key_id: null,
          last_rotated_at: null,
          headers: ['X-OathNet-Signature'],
        },
      });

      const result = await service.getWebhookSecurity('scanner-123');

      expect(result.success).toBe(true);
      expect(result.data?.secret_preview).toBeNull();
      expect(get).toHaveBeenCalledWith(
        '/scanners/scanner-123/webhook-security'
      );
    });

    it('rotates webhook secret and preserves envelope data', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        success: true,
        data: {
          scanner_uid: 'scanner-123',
          webhook_security_mode: 'signed_json',
          secret: 'new-secret',
          secret_preview: 'new-...',
          key_id: null,
          last_rotated_at: null,
        },
      });

      const result = await service.rotateWebhookSecret('scanner-123');

      expect(result.data?.secret).toBe('new-secret');
      expect(post).toHaveBeenCalledWith(
        '/scanners/scanner-123/webhook-security/rotate'
      );
    });

    it('pauses scanners', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({ uid: 'scanner-123', status: 'paused' });

      await service.pause('scanner-123');

      expect(post).toHaveBeenCalledWith('/scanners/scanner-123/pause');
    });

    it('resumes paused or disabled scanners', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({ uid: 'scanner-123', status: 'active' });

      await service.resume('scanner-123');

      expect(post).toHaveBeenCalledWith('/scanners/scanner-123/resume');
    });

    it('triggers scanner runs', async () => {
      const { post, service } = createService();
      post.mockResolvedValue({
        message: 'Scanner run queued',
        scanner_uid: 'scanner-123',
      });

      const result = await service.trigger('scanner-123');

      expect(result.scanner_uid).toBe('scanner-123');
      expect(post).toHaveBeenCalledWith('/scanners/scanner-123/trigger');
    });

    it('lists scanner runs with status and limit params', async () => {
      const { get, service } = createService();
      get.mockResolvedValue([]);

      await service.listRuns('scanner-123', {
        status: 'notification_failed',
        limit: 50,
      });

      expect(get).toHaveBeenCalledWith('/scanners/scanner-123/runs', {
        status: 'notification_failed',
        limit: 50,
      });
    });

    it('gets scanner run detail with encoded scanner and run IDs', async () => {
      const { get, service } = createService();
      get.mockResolvedValue({
        uid: 'run/with space',
        previous_results_count: null,
        results_delta: null,
        notification_logs: [],
      });

      await service.getRun('scanner/with space', 'run/with space');

      expect(get).toHaveBeenCalledWith(
        '/scanners/scanner%2Fwith%20space/runs/run%2Fwith%20space'
      );
    });
  });
});
