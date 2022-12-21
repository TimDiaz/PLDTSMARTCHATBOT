//******************************************************************************************************************************//
// [DEVELOPMENT CONFIGURATION]                                                                                                  //
// const environment = 'DEV'                                                                                                    //
//******************************************************************************************************************************//
// [PRODUCTION CONFIGURATION]                                                                                                   //
// const environment = 'PROD'                                                                                                   //
//******************************************************************************************************************************//
//NOTE: 
// DEV: Environment = DEV; EnvironmentSwitch = DEV;
// UAT: Environment = DEV; EnvironmentSwitch = UAT;
// PROD: Environment = PROD; EnvironmentSwitch = PROD;

const environment = 'DEV';
const environmentSwitch = 'UAT';
const emailtenant = `PLDT`;

function GetESWUPBaseURL(){
    return environment === 'PROD' ? 
            'https://cces.pldtccaas.com/ePLDTCCSPSBSTG/':
            'https://cces.pldtccaas.com/ePLDTCCSPSBSTG/';
}

function GetESWUPTokenPayload(){
    return environment === 'PROD' ? 
        { 
            Username: "ePLDTCCSPSB_STG",
            Password: "WvmH+'~~EWLj8YF%",
            Grant_Type: "password"
        } : 
        { 
            Username: "ePLDTCCSPSB_STG",
            Password: "WvmH+'~~EWLj8YF%",
            Grant_Type: "password"
        };
}

function GetChatbotBaseURL(){
    return environment === 'PROD' ? 
            'https://chatbot171.pldthome.com':
            'https://staging.chatbot171.pldthome.com';
}

function GetBaseURL(){
    return environment === 'PROD' ? 
            'https://www.pldt.com.ph/mobility/' : 
            'https://www.pldt.com.ph/mobility/dev/';
}

function GetAuthToken(){
    return environment === 'PROD' ? 
            'AH5PMt52GhW33gv1zdwuum2X591vTyD637WmFwVZupTpXR4ZG8uF6Q4EbFpbhLXDfEq5U4budhNXEZbAfTdRGzs' : 
            'AH5PMt52GhW33gv1zdwuum2X591vTyD637WmFwVZupTpXR4ZG8tKB6QoFGGj65AaYEKpfKrT9nGYeKxtKadp7GM';
}

function GetCookies(){
    return environment === 'PROD' ? 
            'incap_ses_500_2106196=kF0oTqqW43EE1Al/+lvwBm7uz2IAAAAA7AGUvqEevIqdw/4v96c4sg==; BIGipServerFuse_api_pool_8080=3893700618.36895.0000; BIGipServerMobileITPool=2048859658.16415.0000' : 
            'incap_ses_1234_2106196=Inf6SvgccUmeyqAspwwgEVXpBmMAAAAAGYiFFsilhU6T1OIS5sUvjQ==; BIGipServerMobileITPool=2048859658.16415.0000';
}

function GetBaseUATURL(){
    return 'https://www.pldt.com.ph/mobility/';
}

function GetSwitchURL(){
    return environmentSwitch === "UAT"? 
            GetBaseUATURL(): 
            GetBaseURL();
}

function GetUATAuthToken(){
    return 'AH5PMt52GhW33gv1zdwuum2X591vTyD637WmFwVZupTpXR4ZG8uF6Q4EbFpbhLXDfEq5U4budhNXEZbAfTdRGzs';
}

function GetSwitchAuthToken(){
    return environmentSwitch === "UAT"? 
            GetUATAuthToken(): 
            GetAuthToken();
}

function GetUATCookies(){
    return 'incap_ses_500_2106196=kF0oTqqW43EE1Al/+lvwBm7uz2IAAAAA7AGUvqEevIqdw/4v96c4sg==; BIGipServerFuse_api_pool_8080=3893700618.36895.0000; BIGipServerMobileITPool=2048859658.16415.0000';
}

function GetSwitchCookies(){
    return environmentSwitch === "UAT"? 
            GetUATCookies(): 
            GetCookies();
}



function GetKenanBaseURL(){
    return environment === 'PROD' ? 
            'https://www.pldt.com.ph/mobility/' : 
            'https://www.pldt.com.ph/mobility/';
}

function GetKenanAuthToken(){
    return environment === 'PROD' ? 
            'RiHdHENVs9wA9G10oNj04pz56lJOblywY2o0wCjRmJO3/J2OS4uBvhFQXYjqO/cKuJbbsZrAOvyxwBI8MNcRipdbt/bVKMVWnQnStE9SfD9uNiLrfthEAKy/t4SpaTe9Qqcy5PZPKJeE/5i4Kz7//paTHDOAe/kf1OPbQHupnL3WPDUBisNFSPQwunZf7+4vfuauUko1oBmJep0GOYA00A==' : 
            'RiHdHENVs9wA9G10oNj04pz56lJOblywY2o0wCjRmJO3/J2OS4uBvhFQXYjqO/cKuJbbsZrAOvyxwBI8MNcRipdbt/bVKMVWnQnStE9SfD9uNiLrfthEAKy/t4SpaTe9Qqcy5PZPKJeE/5i4Kz7//paTHDOAe/kf1OPbQHupnL3WPDUBisNFSPQwunZf7+4vfuauUko1oBmJep0GOYA00A==';
}

function GetKenanClientId(){
    return environment === 'PROD' ? 
            '12046' : 
            '12046';
}

function GetKenanCookies(){
    return environment === 'PROD' ? 
            'incap_ses_968_2106196=k+LkZ+luin6U5YkMHgdvDRCSfmAAAAAAKN0i1QCVImxn/VGiR25H+g==; ASP.NET_SessionId=u2q1wt0ohrtsjciqm3lpvi5t; BIGipServerFuse_api_pool_8080=3893700618.36895.0000; BIGipServerMobileITPool=2048859658.16415.0000; NSC_Q_WT_QMEUjVIXTC*8097=ffffffff09734f3545525d5f4f58455e445a4a422991' : 
            'incap_ses_968_2106196=k+LkZ+luin6U5YkMHgdvDRCSfmAAAAAAKN0i1QCVImxn/VGiR25H+g==; ASP.NET_SessionId=u2q1wt0ohrtsjciqm3lpvi5t; BIGipServerFuse_api_pool_8080=3893700618.36895.0000; BIGipServerMobileITPool=2048859658.16415.0000; NSC_Q_WT_QMEUjVIXTC*8097=ffffffff09734f3545525d5f4f58455e445a4a422991';
}

//[START] CASE CREATION API Configuration
//[START] CASE CREATION
function GetCaseCreationTokenBaseURL(){
    return environment === 'PROD' ? 
            'https://ap13.salesforce.com/' : 
            'https://d7f000000zntyuaq--cembuat.sandbox.my.salesforce.com/';
}

function GetCaseCreationTokenBaseCookies(){
    return environment === 'PROD' ? 
            'BrowserId=jcVbrq-ZEeqouVkQxnpvMg' : 
            'BrowserId=0j2qkLkkEeuCpWlqoQQsiQ; BrowserId_sec=0j2qkLkkEeuCpWlqoQQsiQ; CookieConsentPolicy=0:0';
}

function GetCaseCreationTokenBaseGrantType(){
    return environment === 'PROD' ? 
            'password' : 
            'password';
}

function GetCaseCreationTokenBaseClientID(){
    return environment === 'PROD' ? 
            '3MVG9d8..z.hDcPJ0zdcOwy1yXRoDqEvv3fEbFlW0A6IClXZ949JJ3xy3RACa6gMaRGS6lISa1xc.gBR_xj_u' : 
            '3MVG9Po2PmyYruunIZR7z32Xb6OjYmP20KzxAmsKiRsY5FzXdjH9ItJPz_B6FPlv960i9bYRWZv2_K3FWhYiI';
}

function GetCaseCreationTokenBaseClientSecret(){
    return environment === 'PROD' ? 
            '4B17263E45555FBEB8AC150384C85A0120B11375B7493B1C53E22B7B53DFE6CB' : 
            '75AEBC8492B1D346F45CD5D5E1E94248A2CD0FF8DA1B3B042F39DD901351241A';
}

function GetCaseCreationTokenBaseUserName(){
    return environment === 'PROD' ? 
            'cemsa@pldt.com.ph' : 
            'cemsa@pldt.com.ph.cembuat';
}

function GetCaseCreationTokenBasePassword(){
    return environment === 'PROD' ? 
            'C3M!mpL3m3nt@t!0nF0rTh3W!nWXYk1VdD1RJXlfbvxu1Z8vsW7' : 
            'C3M!mpL3m3nt@t!0nF0rTh3W!nWXYk1VdD1RJXlfbvxu1Z8vsW7';
}

function GetCaseCreationBaseUrl(){
    return environment === 'PROD' ? 
            'https://ap13.salesforce.com/' : 
            'https://d7f000000zntyuaq--cembuat.sandbox.my.salesforce.com/';
}

function GetCaseCreationBaseCookies(){
    return environment === 'PROD' ? 
            'BrowserId=ZqvYw6VWEeqHszXxYFuXmA' : 
            'BrowserId=FvkqxQMYEe2P-E_vN5gJcw; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1';
}
//[END] CASE CREATION

//[START] CHAT AD CASE CREATE
function GetChatAdCaseCreateTokenBaseURL(){
    return environment === 'PROD' ? 
            'https://cs113.salesforce.com/' : 
            'https://cs113.salesforce.com/';
}

function GetChatAdCaseCreateTokenBaseCookies(){
    return environment === 'PROD' ? 
            'BrowserId=jcVbrq-ZEeqouVkQxnpvMg' : 
            'BrowserId=jcVbrq-ZEeqouVkQxnpvMg';
}

function GetChatAdCaseCreateTokenBaseGrantType(){
    return environment === 'PROD' ? 
            'password' : 
            'password';
}

function GetChatAdCaseCreateTokenBaseClientID(){
    return environment === 'PROD' ? 
            '3MVG9pcaEGrGRoTJDdjdj5oKEFWyh48yIre125qba0yzhMRPCowd1Tq5O_i1cFcIEgN0GOZ46iruHeWRsumi9' : 
            '3MVG9pcaEGrGRoTJDdjdj5oKEFWyh48yIre125qba0yzhMRPCowd1Tq5O_i1cFcIEgN0GOZ46iruHeWRsumi9';
}

function GetChatAdCaseCreateTokenBaseClientSecret(){
    return environment === 'PROD' ? 
            'C15FF3AC2B5E648A50402A9560F23C89EEE56258CDF8184C118F706A2DDEE183' : 
            'C15FF3AC2B5E648A50402A9560F23C89EEE56258CDF8184C118F706A2DDEE183';
}

function GetChatAdCaseCreateTokenBaseUserName(){
    return environment === 'PROD' ? 
            'timothy.diaz@nttdata.com.chatv2' : 
            'timothy.diaz@nttdata.com.chatv2';
}

function GetChatAdCaseCreateTokenBasePassword(){
    return environment === 'PROD' ? 
            'P@THw0rd@123456' : 
            'P@THw0rd@123456';
}

function GetChatAdCaseCreateBaseUrl(){
    return environment === 'PROD' ? 
            'https://cs113.salesforce.com/' : 
            'https://cs113.salesforce.com/';
}

function GetChatAdCaseCreateBaseCookies(){
    return environment === 'PROD' ? 
            'BrowserId=ZqvYw6VWEeqHszXxYFuXmA' : 
            'BrowserId=ZqvYw6VWEeqHszXxYFuXmA';
}
//[END] CHAT AD CASE CREATE
//[START] CHECK WAIT TIME
function GetCheckWaitTimeBaseUrl(){
    return environment === 'PROD' ? 
            'https://d.la2-c1-ukb.salesforceliveagent.com/' : 
            'https://d.la2-c1cs-hnd.salesforceliveagent.com/';
}

function GetCheckWaitTimeBaseCookies(){
    return environment === 'PROD' ? 
            'X-Salesforce-CHAT=!QwHUs1IUHxroNDUroAdUQlA9+CQ4uSAZIBbxE1I786q5cqBSuq+3IR1UxvxROJZ/fGmDB4Wvh4wUQF0=' : 
            'X-Salesforce-CHAT=!eF3gfwR5AOhWbYhvXaWnnx/Wbhtpsw5ceBKbCOrsRzjnWxyYBCox61p0fxSoIhyAWKDRgQ6K84GEphc=';
}

function GetOrgId(){
    return environment === 'PROD' ? 
            '00D7F000000zntY' : 
            '00D0T0000000ce2';
}
//[END] CHECK WAIT TIME
//[END] CASE CREATION API Configuration

function GetNumberServiceabilityToken(){
    return environment === 'PROD' ? 
            'YjQ5NzQyNWItNmE4NC00YzZlLThlM2UtYmU4OGNjZjc2YmQy' : 
            'MDg0OWY2YzAtYjcwZS00ZjQxLTlmMzgtODBjZWRmMjc2MTI2';
}

function GetUATNumberServiceabilityToken(){
    return 'YjQ5NzQyNWItNmE4NC00YzZlLThlM2UtYmU4OGNjZjc2YmQy';
}

function GetSwitchNumberServiceabilityToken(){
    return environmentSwitch === 'UAT' ? 
            GetUATNumberServiceabilityToken() : 
            GetNumberServiceabilityToken();
}

function GetNumberServiceabilityConsumer(){
    return environment === 'PROD' ? 
            'CHATBOT' : 
            'CHATBOT';
}

module.exports = {
    Environment: environment,
    EnvironmentSwitch: environmentSwitch,
    EmailTenant: emailtenant,
    ChatBotBaseUrl: GetChatbotBaseURL(),
    BaseUrl: GetBaseURL(),
    SwitchURL: GetSwitchURL(),
    SwitchToken: GetSwitchAuthToken(),
    SwitchCookies: GetSwitchCookies(),
    AuthToken: GetAuthToken(),
    Cookie: GetCookies(),
    ESWUP: {
        BaseUrl: GetESWUPBaseURL(),
        TokenPayload: GetESWUPTokenPayload()
    },
    NumberServiceability: {
        Token: GetSwitchNumberServiceabilityToken(),
        Consumer: GetNumberServiceabilityConsumer(),
    },
    Kenan: {
        BaseUrl: GetKenanBaseURL(),
        AuthToken: GetKenanAuthToken(),
        ClientID: GetKenanClientId(),
        Cookie: GetKenanCookies(),
    },
    CaseCreation: {
        CaseCreation: {
            TokenBase: {
                Url: GetCaseCreationTokenBaseURL(),
                Cookie: GetCaseCreationTokenBaseCookies(),
                Auth: {
                    GrantType: GetCaseCreationTokenBaseGrantType(),
                    ClientID: GetCaseCreationTokenBaseClientID(),
                    ClientSecret: GetCaseCreationTokenBaseClientSecret(),
                    Username: GetCaseCreationTokenBaseUserName(),
                    Password: GetCaseCreationTokenBasePassword()
                }
            },
            Base: {
                Url: GetCaseCreationBaseUrl(),
                Cookie: GetCaseCreationBaseCookies()
            }
        },
        FollowUpCase: {
            TokenBase: {
                Url: GetCaseCreationTokenBaseURL(),
                Cookie: GetCaseCreationTokenBaseCookies(),
                Auth: {
                    GrantType: GetCaseCreationTokenBaseGrantType(),
                    ClientID: GetCaseCreationTokenBaseClientID(),
                    ClientSecret: GetCaseCreationTokenBaseClientSecret(),
                    Username: GetCaseCreationTokenBaseUserName(),
                    Password: GetCaseCreationTokenBasePassword()
                }
            },
            Base: {
                Url: GetCaseCreationBaseUrl(),
                Cookie: GetCaseCreationBaseCookies()
            }
        },
        ChatAdCaseCreate: {
            TokenBase: {
                Url: GetChatAdCaseCreateTokenBaseURL(),
                Cookie: GetChatAdCaseCreateTokenBaseCookies(),
                Auth: {
                    GrantType: GetChatAdCaseCreateTokenBaseGrantType(),
                    ClientID: GetChatAdCaseCreateTokenBaseClientID(),
                    ClientSecret: GetChatAdCaseCreateTokenBaseClientSecret(),
                    Username: GetChatAdCaseCreateTokenBaseUserName(),
                    Password: GetChatAdCaseCreateTokenBasePassword()
                }
            },
            Base: {
                Url: GetChatAdCaseCreateBaseUrl(),
                Cookie: GetChatAdCaseCreateBaseCookies()
            }
        },
        CheckWaitTime: {
            Base: {
                Url: GetCheckWaitTimeBaseUrl(),
                Cookie: GetCheckWaitTimeBaseCookies(),
                OrgId: GetOrgId()
            }
        }
    }
};