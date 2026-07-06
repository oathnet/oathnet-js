/**
 * Scanners Service - automated breach and stealer monitoring.
 */

import { OathNetClient } from '../client';
import {
  Scanner,
  ScannerCreateRequest,
  ScannerDraftTestRequest,
  ScannerQuota,
  ScannerRun,
  ScannerRunDetail,
  ScannerRunStatus,
  ScannerStatus,
  ScannerTestResponse,
  ScannerTriggerResponse,
  ScannerType,
  ScannerUpdateRequest,
  ScannerWebhookRotateResponse,
  ScannerWebhookSecurityResponse,
} from '../types';

export interface ScannerListParams {
  status?: ScannerStatus;
  scannerType?: ScannerType;
}

export interface ScannerRunsParams {
  status?: ScannerRunStatus;
  limit?: number;
}

export class ScannersService {
  constructor(private client: OathNetClient) {}

  /**
   * Get the current user's scanner quota.
   */
  async getQuota(): Promise<ScannerQuota> {
    return this.client.get<ScannerQuota>('/scanners/quota');
  }

  /**
   * List scanners, optionally filtered by status or scanner type.
   */
  async list(params: ScannerListParams = {}): Promise<Scanner[]> {
    return this.client.get<Scanner[]>(
      '/scanners',
      this.cleanParams({
        status: params.status,
        scanner_type: params.scannerType,
      })
    );
  }

  /**
   * Create a scanner.
   */
  async create(request: ScannerCreateRequest): Promise<Scanner> {
    return this.client.post<Scanner>('/scanners/create', request);
  }

  /**
   * Get scanner details.
   */
  async get(scannerUid: string): Promise<Scanner> {
    return this.client.get<Scanner>(`/scanners/${this.encode(scannerUid)}`);
  }

  /**
   * Partially update a scanner. Use pause/resume for status changes.
   */
  async update(
    scannerUid: string,
    request: ScannerUpdateRequest
  ): Promise<Scanner> {
    return this.client.patch<Scanner>(
      `/scanners/${this.encode(scannerUid)}/update`,
      request
    );
  }

  /**
   * Delete a scanner. The API returns 204 with no response body.
   */
  async delete(scannerUid: string): Promise<void> {
    return this.client.delete<void>(
      `/scanners/${this.encode(scannerUid)}/delete`
    );
  }

  /**
   * Test delivery for an unsaved scanner.
   *
   * A 200 response can include success: false when the remote delivery failed;
   * callers should inspect the returned result instead of treating it as an SDK
   * exception.
   */
  async testDelivery(
    request: ScannerDraftTestRequest
  ): Promise<ScannerTestResponse> {
    return this.client.post<ScannerTestResponse>(
      '/scanners/test-delivery',
      request
    );
  }

  /**
   * Send a test notification for an existing scanner.
   */
  async testNotification(scannerUid: string): Promise<ScannerTestResponse> {
    return this.client.post<ScannerTestResponse>(
      `/scanners/${this.encode(scannerUid)}/test`
    );
  }

  /**
   * Inspect webhook verification configuration for a scanner.
   */
  async getWebhookSecurity(
    scannerUid: string
  ): Promise<ScannerWebhookSecurityResponse> {
    return this.client.get<ScannerWebhookSecurityResponse>(
      `/scanners/${this.encode(scannerUid)}/webhook-security`
    );
  }

  /**
   * Rotate the saved webhook secret for a scanner.
   */
  async rotateWebhookSecret(
    scannerUid: string
  ): Promise<ScannerWebhookRotateResponse> {
    return this.client.post<ScannerWebhookRotateResponse>(
      `/scanners/${this.encode(scannerUid)}/webhook-security/rotate`
    );
  }

  /**
   * Pause scanner scheduling.
   */
  async pause(scannerUid: string): Promise<Scanner> {
    return this.client.post<Scanner>(
      `/scanners/${this.encode(scannerUid)}/pause`
    );
  }

  /**
   * Resume a paused or disabled scanner.
   */
  async resume(scannerUid: string): Promise<Scanner> {
    return this.client.post<Scanner>(
      `/scanners/${this.encode(scannerUid)}/resume`
    );
  }

  /**
   * Queue an immediate scanner run.
   */
  async trigger(scannerUid: string): Promise<ScannerTriggerResponse> {
    return this.client.post<ScannerTriggerResponse>(
      `/scanners/${this.encode(scannerUid)}/trigger`
    );
  }

  /**
   * List recent scanner runs.
   */
  async listRuns(
    scannerUid: string,
    params: ScannerRunsParams = {}
  ): Promise<ScannerRun[]> {
    return this.client.get<ScannerRun[]>(
      `/scanners/${this.encode(scannerUid)}/runs`,
      this.cleanParams({
        status: params.status,
        limit: params.limit,
      })
    );
  }

  /**
   * Get scanner run details.
   */
  async getRun(scannerUid: string, runUid: string): Promise<ScannerRunDetail> {
    return this.client.get<ScannerRunDetail>(
      `/scanners/${this.encode(scannerUid)}/runs/${this.encode(runUid)}`
    );
  }

  private cleanParams(params: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );
  }

  private encode(value: string): string {
    return encodeURIComponent(value);
  }
}
