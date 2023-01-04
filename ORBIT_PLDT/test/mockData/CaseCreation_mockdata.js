const moment = require('moment');
const currentDate = moment();

const ValidFutureUserDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).add(3, 'days').format('MM/DD/YYYY')
    }
}

const InvalidFutureUserDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).add(4, 'days').format('MM/DD/YYYY')
    }
}

const InvalidPreviousUserDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).subtract(1, 'days').format('MM/DD/YYYY')
    }
}

const InvalidUserDate = {
    statusCode: 200,
    data: {
        "Date": '01/32/2023'
    }
}

const UserDateGreaterThanCurrentDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).add(1, 'days').format('MM/DD/YYYY')
    }
}

const UserDateLessThanCurrentDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).subtract(2, 'days').format('MM/DD/YYYY')
    }
}

const UserDateEqualCurrentDate = {
    statusCode: 200,
    data: {
        "Date": moment(currentDate).format('MM/DD/YYYY')
    }
}

const AvailableAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                            "estimatedWaitTime": 30
                        }
                    ]
                }
            }
        ]
    }
}

const LessThanMaxThresholdAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                            "estimatedWaitTime": 317
                        }
                    ]
                }
            }
        ]
    }
}

const GreaterThanMaxThresholdAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                            "estimatedWaitTime": 2219
                        }
                    ]
                }
            }
        ]
    }
}

const UndefinedEstimatedWaitTimeAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                        }
                    ]
                }
            }
        ]
    }
}

const NullEstimatedWaitTimeAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                            "estimatedWaitTime": null
                        }
                    ]
                }
            }
        ]
    }
}

const NaNEstimatedWaitTimeAgents = {
    statusCode: 200,
    data: {
        "messages": [
            {
                "type": "Availability",
                "message": {
                    "results": [
                        {
                            "estimatedWaitTime": NaN
                        }
                    ]
                }
            }
        ]
    }
}


module.exports = {
    PaymentDate: {
        ValidFutureUserDate: ValidFutureUserDate,
        InvalidFutureUserDate: InvalidFutureUserDate,
        InvalidUserDate: InvalidUserDate,
        InvalidPreviousUserDate: InvalidPreviousUserDate
    },
    FollowUpDate:{
        UserDateLessThanCurrentDate: UserDateLessThanCurrentDate,
        UserDateEqualCurrentDate: UserDateEqualCurrentDate,
        UserDateGreaterThanCurrentDate: UserDateGreaterThanCurrentDate,
        InvalidUserDate: InvalidUserDate
    },
    CheckWaitTime:{
        AvailableAgents: AvailableAgents,
        LessThanMaxThresholdAgents: LessThanMaxThresholdAgents,
        GreaterThanMaxThresholdAgents: GreaterThanMaxThresholdAgents,
        UndefinedEstimatedWaitTimeAgents: UndefinedEstimatedWaitTimeAgents,
        NullEstimatedWaitTimeAgents: NullEstimatedWaitTimeAgents,
        NaNEstimatedWaitTimeAgents
    }
}