import { http, HttpResponse } from "msw";

const API_BASE = "https://admin-api.herald.xyz/v1";

export const handlers = [
  // Auth Mocks
  http.post(`${API_BASE}/auth/wallet-login`, () => {
    return HttpResponse.json({
      accessToken: "mock_jwt_eyh...",
      refreshToken: "mock_refresh_abc...",
    });
  }),

  // Protocol Identity Mocks
  http.get(`${API_BASE}/protocols/me`, () => {
    return HttpResponse.json({
      id: "prt_dev123",
      name: "LiquidStake Protocol",
      websiteUrl: "https://liquidstake.xyz",
      logoUrl: "https://liquidstake.xyz/logo.png",
      fromName: "LiquidStake Alerts",
    });
  }),
  
  http.get(`${API_BASE}/protocols/me/status`, () => {
    return HttpResponse.json({
      tier: 0,
      subscriptionActive: true,
      onChainState: "verified",
    });
  }),

  // API Key Mocks
  http.get(`${API_BASE}/api-keys`, () => {
    return HttpResponse.json({
      keys: [
        {
          id: "key_1",
          name: "Live Web Backend",
          prefix: "hrld_live_4xR9...",
          environment: "live",
          scopes: ["notify:write", "analytics:read"],
          createdAt: "2026-03-20T10:00:00Z",
        },
        {
          id: "key_2",
          name: "Test Runner",
          prefix: "hrld_test_8mQ2...",
          environment: "test",
          scopes: ["notify:write"],
          createdAt: "2026-03-22T14:30:00Z",
        },
      ],
    });
  }),

  http.post(`${API_BASE}/api-keys`, async ({ request }) => {
    const data = await request.json() as { name: string, environment: string };
    return HttpResponse.json({
      keyInfo: {
        id: "key_new",
        name: data.name,
        prefix: `hrld_${data.environment}_NEW0...`,
        environment: data.environment,
        scopes: ["notify:write"],
        createdAt: new Date().toISOString(),
      },
      plainTextKey: `hrld_${data.environment}_NEW0_SUPER_SECRET_KEY_NEVER_SHOWN_AGAIN`,
    }, { status: 201 });
  }),

  // Analytics Drop Mocks
  http.get(`${API_BASE}/analytics`, () => {
    return HttpResponse.json({
      totalSends: 14205,
      deliveryRate: 0.985,
      bounceRate: 0.011,
      failureRate: 0.004,
      sendsPerDay: [
        { date: "2026-03-24", count: 850 },
        { date: "2026-03-25", count: 1240 },
        { date: "2026-03-26", count: 930 },
      ],
      categoryBreakdown: {
        defi: 8400,
        governance: 3205,
        marketing: 1500,
        system: 1100,
      }
    });
  })
];
