"use strict";

module.exports = {
    invoke: async (mockRequestType, mockRequest, component) => {
        const Testing = require('@oracle/bots-node-sdk/testing');

        const mockContext = Testing.MockConversation.fromRequest(mockRequest);
        var logger = mockContext.logger();

        logger.debug = console.log;
        logger.error = console.log;
        logger.fatal = console.log;
        logger.info = console.log;
        logger.trace = console.log;
        logger.warn = console.log;

        await component.invoke(mockContext);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        setTimeout(()=> {logger.info(JSON.stringify(mockContext, null, 2));}, 5000);
        
    }
}