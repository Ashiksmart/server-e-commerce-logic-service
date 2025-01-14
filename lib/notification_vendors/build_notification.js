

// const database = require("../database");
const { google_mail } = require('./google_mail')

function replacePlaceholders(template, data, server) {
    try {
        return template.replace(/{{(.*?)}}/g, (match, key) => data[key] || match);
    } catch (error) {
        console.log("error", error);
        throw err;
    }
}
const client = async (payload, notification_info, type, server) => {
    try {
        let fetch_userdata
        if (type === "email" && payload.email !== undefined) {
            // fetch_userdata = await database('user').select("*").where({ "email": payload.email, roles: notification_info.reciver })
            fetch_userdata = await server.knex().from("user").select("*").where({ "email": payload.email, roles: notification_info.reciver })
            if (fetch_userdata.length === 0) {
                let arr = []
                arr.push(payload)
                fetch_userdata = arr
            }
        } else if (payload.user_id !== undefined) {
            // fetch_userdata = await database('user').select("*").where({ "id": payload.user_id, roles: notification_info.reciver })
            fetch_userdata = await server.knex().from("user").select("*").where({ "id": payload.user_id, roles: notification_info.reciver })

        } else if (type === "email" && fetch_data[0].user_id) {
            // fetch_userdata = await database('user').select("*").where({ "id": fetch_data[0].user_id, roles: notification_info.reciver })
            fetch_userdata = await server.knex().from("user").select("*").where({ "id": fetch_data[0].user_id, roles: notification_info.reciver })
        }
        return fetch_userdata
    } catch (error) {
        console.log("error", error);
        throw err;
    }
}
const admin = async (payload, notification_info, type, server) => {
    try {
        let fetch_userdata
        let reciver_detail = []
        if (type === "email" && payload.email !== undefined) {
            // fetch_userdata = await database('user').select("*").where({ "email": payload.email, roles: notification_info.reciver })
            fetch_userdata = await server.knex().from("user").select("*").where({ "email": payload.email, roles: notification_info.reciver })
            if (fetch_userdata.length === 0) {
                let arr = []
                arr.push(payload)
                fetch_userdata = arr
            }
            reciver_detail.push(fetch_userdata[0])

        } else {
            let userid = notification_info.staff_id.split(',')
            for (let i = 0; i < userid.length; i++) {
                // fetch_userdata = await database('user').select("*").where({ "id": userid[i] })
                fetch_userdata = await server.knex().from("user").select("*").where({ "id": userid[i] })
                reciver_detail.push(fetch_userdata[0])
            }

        }
        return reciver_detail
    } catch (error) {
        console.log("error", error);
        throw err;
    }
}
const build_notification = async (template_details, credits, notification_info, payload, model, type, vendor_details, template_content,server) => {
   
    try {
        let count = 0
        let rules = JSON.parse(notification_info.rules)
        // let fetch_data = await database(model).select("*").where({ ...{ "id": payload.id }, ...rules })
        let fetch_data = await server.knex().from(model).select("*").where({ ...{ "id": payload.id }, ...rules })
        if (fetch_data.length > 0) {
            let reciver_detail = []
            let fetch_userdata

            if ("Client" === notification_info.reciver) {
                fetch_userdata = await client(payload, notification_info, type, server)
                if (fetch_userdata.length > 0) {
                    reciver_detail.push(fetch_userdata[0])
                }

            } else {
                reciver_detail = await admin(payload, notification_info, type, server)
            }
            for (let i = 0; i < reciver_detail.length; i++) {
                let data_ = fetch_data[0]
                let info={}
                if(payload.additional_info !== undefined){
                    info=payload.additional_info
                    delete payload.additional_info
                }
                var currentDate = new Date();
                data_['year'] = currentDate.getFullYear();
                data_['month'] = currentDate.getMonth() + 1;
                data_['date'] = currentDate.getDate();
                let tempdata={ ...data_, ...payload }
                let mergeinfo={ ...tempdata, ...info }
                let data = { ...mergeinfo, ...reciver_detail[i] }
                if (vendor_details === 'google_mail') {

                    let template = template_details.template_message

                    let content_json = JSON.parse(template_content.content)
                    let replace_dynamic_value = replacePlaceholders(template, data, server);
                    const replacedString = replacePlaceholders(replace_dynamic_value, content_json, server);
                    const replace_subject = replacePlaceholders(template_details.subject, data, server);
                    // data.email = "ragulraghavan75066@gmail.com"
                    // data.useremail = "arjayabalan09@gmail.com"
                    let send_mail = google_mail(data.email, replacedString, data, credits, replace_subject, notification_info.attachment)
                    if (send_mail.statusCode === 200) {
                        count += 1
                    }
                }
            }
        }
        if (count > 0) {
            return true
        }
    } catch (error) {
        console.log("error", error);
        throw error;
    }

}
module.exports = { build_notification };