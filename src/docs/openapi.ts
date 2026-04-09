export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "PROGRAM API",
    version: "1.0.0",
    description:
      "API for courses, progress, payments, refunds, notifications, messaging, discussions, certificates, earnings, and admin.",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "API is healthy",
          },
        },
      },
    },
    "/progress/user/{userId}/courses/{courseId}": {
      get: {
        summary: "Get course progress for user",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "courseId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Progress details",
          },
        },
      },
    },
    "/payments": {
      post: {
        summary: "Create payment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  courseId: { type: "string" },
                  amountCents: { type: "integer" },
                },
                required: ["userId", "courseId", "amountCents"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Payment created",
          },
        },
      },
    },
  },
};

