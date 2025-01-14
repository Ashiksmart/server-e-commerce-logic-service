"use strict";

const Schmervice = require("@hapipal/schmervice");
const Boom = require("@hapi/boom");

module.exports = class CommonService extends Schmervice.Service {

    async centralLink(Type,actionPayload){
        try {
            this[Type](actionPayload)
        } catch (error) {
            console.log("CommonService Error:",error);
        }
    }

    async activity({model,mode,account_id,model_id,payload,oldobj,newobj}){
        try {
            const { commonActivityHistory } = this.server.app.services
            const { UPDATE } = this.server.app.constant.mode
            if(typeof commonActivityHistory == "object"){
                if(payload){
                    delete payload.scope
                    delete payload.exp
                    delete payload.iat
                }
    
                model_id.forEach(async (ModelId) => {
                    let value
                    if(mode == UPDATE){
                        value = await commonActivityHistory.compareObjects(oldobj,newobj)
                    }
                    commonActivityHistory.create(model,ModelId,account_id,mode,payload,value)
                })
            }else{
                console.log("CommonService Error: NO SERVICE");
            }
            
        } catch (error) {
            console.log("CommonService Error:",error);
        }
    }

    async fetch({model,model_id,field}){
        try {
            const { commonActivityHistory } = this.server.app.services
            if(typeof commonActivityHistory == "object"){
                field = Object.keys(field)
                return await commonActivityHistory.fetchByData(model,model_id,field)
            }else{
                console.log("CommonService Error: NO SERVICE");
                return "NO SERVICE"
            }
            
        } catch (error) {
            console.log("CommonService Error:",error);
        }
    }

    async notification({model, payload, account_id}){
        try {
            const { engine } = this.server.app.services
            if(typeof engine == "object"){
                engine.notification(model, payload, account_id)
            }else{
                console.log("CommonService Error: NO SERVICE");
                return "NO SERVICE"
            }
            
        } catch (error) {
            console.log("CommonService Error:",error);
        }
    }

}