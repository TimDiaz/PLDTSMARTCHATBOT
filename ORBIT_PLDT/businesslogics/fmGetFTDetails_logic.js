class FMGetFTDetails_BussinessLogic {
    constructor(log, prop) {
        this.logger = log;
        this.globalProp = prop
    }

    CheckSType(serviceType){
        let conversation = {
            Variables: [{name: 'serviceType', value: serviceType}],
            Transition: ''
        };
        let prop = this.globalProp.FMGetFTDetails.ConnectionType;

        if (serviceType.includes(prop.POTSADSL) || (serviceType.includes(prop.ADSL) && serviceType.includes(prop.POTS)) || serviceType.includes(prop.ADSLPOTS)){
            conversation.Transition = 'withBoth';
        }        
        else if (serviceType.includes(prop.ADSL)){
            //Fix Internet Only
            conversation.Transition = 'internetOnly';
        }
        else if (serviceType.includes(prop.POTS)){
            //Fix landline Only
            conversation.Transition = 'landlineOnly';
        }                    
        else{
            conversation.Transition = 'failure';
        }
        return conversation;
    }

    FMInternet(serviceType){
        let conversation = {
            Variables: [{name: 'serviceType', value: serviceType}],
            Transition: ''
        };
        let prop = this.globalProp.FMGetFTDetails.ConnectionType;

        if (serviceType.includes(prop.POTSADSL) || (serviceType.includes(prop.ADSL) && serviceType.includes(prop.POTS)) || serviceType.includes(prop.ADSLPOTS) || serviceType.includes(prop.ADSL)){
            conversation.Transition = 'withInternet';
        }
        else{
            conversation.Transition = 'withoutInternet';
        }
        return conversation;
    }

    FMLandline(serviceType){
        let conversation = {
            Variables: [{name: 'serviceType', value: serviceType}],
            Transition: ''
        };
        let prop = this.globalProp.FMGetFTDetails.ConnectionType;

        if(serviceType.includes(prop.POTSADSL) || (serviceType.includes(prop.ADSL) && serviceType.includes(prop.POTS)) || serviceType.includes(prop.ADSLPOTS) || serviceType.includes(prop.POTS)){
            conversation.Transition = 'withLandline';
        }
        else{
            conversation.Transition = 'withoutLandline';
        }
        return conversation;
    }
}
module.exports = {
    Logic: FMGetFTDetails_BussinessLogic
}