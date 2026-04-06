import { apiClient } from "../api-client";
import { TestSendDto, TestSendResult, PaginatedNotifications } from "@/types/api";

const BASE = "/notifications";

export async function testSend(dto: TestSendDto): Promise<TestSendResult> {
  const { data } = await apiClient.post<TestSendResult>(`${BASE}/test-send`, dto);
  return data;
}

export async function listNotifications(page = 1, limit = 20): Promise<PaginatedNotifications> {
  const { data } = await apiClient.get<PaginatedNotifications>(BASE, {
    params: { page, limit },
  });
  return data;
}
