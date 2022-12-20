const ValidResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const InvalidResponse = {
    statusCode: 200,
    data: {
        "errorMessage": "You have error in your account",
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const SuspendedResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Suspended"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const BarredResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Barred"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const UndefinedCurrentBalanceResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const NullCurrentBalanceResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": null
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const UndefinedDueDateResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
            }
        ]
    }
}

const NullDueDateResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": "mock@email.com",
                "balanceDueDate": null
            }
        ]
    }
}

const UndefinedEmailAddResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

const NullEmailAddResponse = {
    statusCode: 200,
    data: {
        "errorMessage": null,
        "balanceProfile": {
            "currentBalance": "999.99"
        },
        "serviceProfiles": [
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            },
            {
                "serviceStatus": "Active"
            }
        ],
        "customerProfile": [
            {
                "emailAddress": null,
                "balanceDueDate": "1-JAN-22"
            }
        ]
    }
}

module.exports = {
    ValidResponse: ValidResponse,
    InvalidResponse: InvalidResponse,
    SuspendedResponse: SuspendedResponse,
    BarredResponse: BarredResponse,
    UndefinedCurrentBalanceResponse: UndefinedCurrentBalanceResponse,
    NullCurrentBalanceResponse: NullCurrentBalanceResponse,
    UndefinedDueDateResponse: UndefinedDueDateResponse,
    NullDueDateResponse: NullDueDateResponse,
    UndefinedEmailAddResponse: UndefinedEmailAddResponse,
    NullEmailAddResponse: NullEmailAddResponse
}