const apiBaseConfig = require('../apiBase_config');

module.exports = {
    API: {
        Name: "AccountEligibility",
        GetOptions: (serviceNumber) => {
            return {
                'method': 'GET',
                'url': `${apiBaseConfig.BaseUrl}amdocs/api/account/eligibility/${serviceNumber}`,
                'headers': {
                    'Content-Type': 'application/json',
                    'X-Pldt-Auth-Token': apiBaseConfig.AuthToken,
                    'Cookie': apiBaseConfig.Cookie,
                    'Accept': 'application/json',
                }
            }
        }
    },
    Validation: {
        DigitsOnly: /\d+/g,
        NumberRange: /([0-9]+)/,
        Tier: /(PARENT|CHILD)/g,
        Types: /(VOLUME COMPLAINT|CR|TT|SQDT|PDT)/g
    },
    Types: {
        UnderTreatment: { Message: 'Under Treatment.', Conversation: { Transition: 'undertreatment', Variables: ['ineligibleAcctmsg'] }},
        WithOpenRepairTicket: { Message: 'With Open Repair Ticket.',
            Tier: {
                Conversation: { Variables: ['ticketNumber']},
                Parent: {
                    Name: "PARENT",
                    TicketTypes: {
                        Conversation: { Variables: ['ParentType']},
                        VC: {
                            Name: 'VOLUME COMPLAINT',
                            Conversation: { Transition: 'withOpenParentVC'}                                
                        },
                        CR: {
                            Name: 'CR',
                            Conversation: { Transition: 'withOpenParentVC'}                                
                        },
                        Default: {
                            Conversation: { Transition: 'withOpenParent'}                                
                        }
                    }
                },
                Child: {
                    Name: "CHILD",
                    TicketTypes: { Conversation: { Transition: 'withOpenChildTicket' }}              
                },
                Default: {
                    Conversation: { Transition: 'withOpenIndTicket', Variables: ['indiTicketSpiel']},
                    Types: {
                        InitialDiagnosis: {
                            Validation: /(VAS SUPPORT|SUB_HOMECARE|HOME-HELD|HOME-FLM|HOME OUTBOUND|HOME CARE|FLM-TOKUNDEROB|FLM-TOKNOANSWER|DEVIATED-TELEPERFORM|DEVIATED-STERLING|DEVIATED-INFOCOM|CONVERGED STORE|CKL_HOMECARE|CCARE|STORE)/g,
                            PromWordSpiel: 'Our restoration team is conducting initial diagnosis and troubleshooting for your repair ticket number ${ticketNumber}. We have made a follow-up and will give you an update via SMS in 48 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.',
                        },
                        Testing: {
                            Validation: /(TECHRES-FRD|TECHRES-UNDEROB|TECHRES-CONFIRM-CLOSE|TECH-RESOLUTION|TECHRES-IPTV)/g,
                            PromWordSpiel: 'Our restoration team is conducting testing for your repair ticket number. We will give you an update within 24 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, send us a message at https://m.me/PLDTHome or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.',
                        },
                        Dispatched: {
                            Validation: /(BAT_OPSIM|BCD_OPSIM|BGO_OPSIM|BICOL_OPSIM|C.VALLEY_OPSIM|CAI_OPSIM|CAMANAVA_OPSIM|CEBU_OPSIM|CVE_OPSIM|DAVAO_OPSIM|DGP_OPSIM|GEN SAN_OPSIM|ILOCOS_OPSIM|LAGUNA_OPSIM|LEYTE_OPSIM|MARATEL_OPSIM|MIG_OPSIM|MKT_OPSIM|MLL_OPSIM|MRN_OPSIM|MYG_OPSIM|NOMLA_OPSIM|NQC_OPSIM|PANAY_OPSIM|PASIG_OPSIM|PBZ_OPSIM|PHILCOM_OPSIM|PSALM_OPSIM|PSY-PRQ_OPSIM|QUEZON_OPSIM|SBI_OPSIM|SFP_OPSIM|SOMLA_OPSIM|SQC_OPSIM|SUB_OPSIM|TRC-NE_OPSIM|ZAMBO_OPSIM|CKL_OPSIM|SAMAR-LEYTE_OPSIM|PLDT PHILCOM_OPSIM|APMS-DISPATCH|OFSC-DISPATCH|SMR-LYT-BOH_OPSIM|SOUTH CEBU_OPSIM|NORTH CEBU_OPSIM)/g,
                            PromWordSpiel: 'Your repair request number ${ticketNumber} is now dispatched to our field operations team. Our technician will visit your premises, if needed. Please be reminded that our technician is not authorized to receive payment during repair. You may report issues encountered with our technician thru https://pldthome.info/technicianreports. I will also log a follow up to this ticket on your behalf and we will provide updates on the progress of this request thru SMS.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.',
                        },
                        FurtherTesting: {
                            Validation: /(BZ-MCT|BZ-MIGRATION|BZ-PREMIGRATION|BZ-PREV-MTCE|CLRMD-MNFC|CLRMD-MNFC-CLOSE|CLRMV-MNFC|FSMG|NETRES|NETRES-ACCESS|NETRES-CORE|NETRES-DATA-SHD|NETRESD-FR-1|NETRESD-FR-2|NETRESD-FR-3|NETRESD-FR-4|NETRESD-FR-5|NETRESD-NR-1|NETRESD-NR-2|NETRESD-NR-3|NETRESD-NR-4|NETRESD-NR-5|NETRES-TRANSPORT|NETRES-VOICE|NETRES-VOICE-SHD|NETWORK MIGRATION|SDM|SDM FALLOUT-HOME|NETWORK_FFS_PPM|NETWORK_BUILD-PM|NETWORK_ACCESS-ENGG|BUILD_OPPM_GMM|BUILD_OPPM_VISMIN|BUILD_OPPM_LUZON|NETRES-DATA|NETRES-HD|NET_ACCESS_PLANNING|NETWORK_ACCESS_ENGG)/g,
                            PromWordSpiel: 'Our network engineers are conducting further testing and diagnosis for your repair ticket number. We will give you an update within 24 hours.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker, send us a message at https://m.me/PLDTHome or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.',
                        },
                        Resolved: {
                            Validation: /(FM_POLL)/g,
                            PromWordSpiel: 'Your ticket number has been resolved and service has been restored. Please call 171 within 48 hours if the issue persists. Otherwise, the ticket will be closed. Thank you.',
                        },
                        Deafult: {
                            PromWordSpiel: 'Our restoration team is conducting testing for your repair ticket number ${ticketNumber}.\n\nTo track the status of your ticket, please visit https://pldthome.com/pldt-tracker or text PLDTTRACK to 8171 for Smart and TNT for free; or 0970 0000 171 for other networks. Thank you.',
                        }
                    }
                }
            }
        },
        InvalidServiceNumber: { Message: 'Invalid service number', Conversation: { Transition: 'undertreatment', Variables: ['ineligibleAcctmsg'] }},
        WithOpenSO: { Message: 'With Open SO.', Conversation: { Transition: 'undertreatment', Variables: ['ineligibleAcctmsg', 'openSONumber'] }},
        WithOpenTransferSO: { Message: 'With Open Transfer SO.', Conversation: { Transition: 'undertreatment', Variables: ['ineligibleAcctmsg', 'openSONumber'] }},
        AccountIsNotRBG: { Message: 'Account is not RBG.', Conversation: { Transition: 'undertreatment', Variables: ['ineligibleAcctmsg'] }},
        OpenOrder: { Conversation: { Transition: 'openorder', Variables: ['ineligibleAcctmsg', 'openSONumber'] }},
    }
}