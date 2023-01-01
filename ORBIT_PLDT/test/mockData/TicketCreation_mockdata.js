const CreateFTError406SpielResponse = {
    statusCode: 406,
    data: {
        "ticketNumber": null,
        "message": null,
        "spiel": "Spiel Invalid telephone number"
    }
}

const CreateFTError406MsgResponse = {
    statusCode: 406,
    data: {
        "ticketNumber": null,
        "message": "Message Invalid telephone number",
        "spiel": null
    }
}

const CreateFTErrorDefaultMsgResponse = {
    data: {
        "ticketNumber": null,
        "message": null,
        "spiel": null
    }
}

const CreateFTSuccessNullTNResponse = {
    statusCode: 200,
    data: {
        "ticketNumber": null,
        "message": null,
        "spiel": "Spiel success"
    }
}

const CreateFTSuccessResponse = {
    statusCode: 200,
    data: {
        "ticketNumber": "00000001",
        "message": null,
        "spiel": "Spiel success"
    }
}

module.exports = {
    Error406SpielResponse: CreateFTError406SpielResponse,
    Error406MsgResponse: CreateFTError406MsgResponse,
    ErrorDefaultMsgResponse: CreateFTErrorDefaultMsgResponse,
    SuccessNullTNResponse: CreateFTSuccessNullTNResponse,
    SuccessResponse: CreateFTSuccessResponse
}