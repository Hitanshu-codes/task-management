export default {
    openapi: '3.0.0',
    info: {
        title: 'Task Management API',
        version: '1.0.0',
        description: 'API documentation for Task Management system '
    },
    servers: [
        { url: 'http://localhost:5000', description: 'Local dev' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['user', 'admin'] }
                }
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                }
            },
            Task: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    dueDate: { type: 'string', format: 'date-time' },
                    assignedTo: { $ref: '#/components/schemas/User' },
                    createdBy: { $ref: '#/components/schemas/User' },
                    attachments: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                filename: { type: 'string' },
                                originalName: { type: 'string' },
                                path: { type: 'string' },
                                size: { type: 'number' },
                                uploadedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/api/health': {
            get: {
                summary: 'Health check',
                security: [],
                responses: { '200': { description: 'OK' } }
            }
        },

        '/api/auth/register': {
            post: {
                summary: 'Register a new user',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    '400': { description: 'Bad request' }
                }
            }
        },

        '/api/auth/login': {
            post: {
                summary: 'Login',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    '401': { description: 'Unauthorized' }
                }
            }
        },

        '/api/auth/me': {
            get: {
                summary: 'Get current user',
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } },
                    '401': { description: 'Unauthorized' }
                }
            }
        },

        '/api/users': {
            get: {
                summary: 'List users (admin only)',
                parameters: [
                    { in: 'query', name: 'page', schema: { type: 'integer' } },
                    { in: 'query', name: 'limit', schema: { type: 'integer' } },
                    { in: 'query', name: 'search', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'OK' },
                    '403': { description: 'Forbidden' }
                }
            },
            post: {
                summary: 'Create user (admin only)',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    role: { type: 'string', enum: ['user', 'admin'] }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Created' }, '403': { description: 'Forbidden' } }
            }
        },

        '/api/users/{id}': {
            put: {
                summary: 'Update user (admin only)',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    role: { type: 'string', enum: ['user', 'admin'] }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } }
            },
            delete: {
                summary: 'Delete user (admin only)',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } }
            }
        },

        '/api/users/list': {
            get: {
                summary: 'List users for assignment (any authenticated user)',
                responses: { '200': { description: 'OK' } }
            }
        },

        '/api/tasks': {
            get: {
                summary: 'List tasks with filters',
                parameters: [
                    { in: 'query', name: 'page', schema: { type: 'integer' } },
                    { in: 'query', name: 'limit', schema: { type: 'integer' } },
                    { in: 'query', name: 'status', schema: { type: 'string' } },
                    { in: 'query', name: 'priority', schema: { type: 'string' } },
                    { in: 'query', name: 'search', schema: { type: 'string' } },
                    { in: 'query', name: 'sortBy', schema: { type: 'string' } },
                    { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'] } }
                ],
                responses: { '200': { description: 'OK' } }
            },
            post: {
                summary: 'Create task (multipart/form-data for PDFs)',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'dueDate', 'assignedTo'],
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    dueDate: { type: 'string', format: 'date' },
                                    assignedTo: { type: 'string' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                                    attachments: { type: 'array', items: { type: 'string', format: 'binary' } }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Created' } }
            }
        },

        '/api/tasks/{id}': {
            get: {
                summary: 'Get a task by id',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } }
            },
            put: {
                summary: 'Update a task (multipart/form-data for PDFs)',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    dueDate: { type: 'string', format: 'date' },
                                    assignedTo: { type: 'string' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                                    attachments: { type: 'array', items: { type: 'string', format: 'binary' } }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } }
            },
            delete: {
                summary: 'Delete a task',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } }
            }
        },

        '/api/tasks/{id}/attachments/{attachmentId}': {
            get: {
                summary: 'Download task attachment',
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                    { in: 'path', name: 'attachmentId', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'File' }, '404': { description: 'Not Found' } }
            }
        }
    }
};
