/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @hapi/hapi/scope-start */
/* eslint-disable strict */
const Joi = require('joi');

const category = () => {
    const validateObj = {
        id: Joi.string().trim().optional(),
        category_name: Joi.string().trim().required(),
        app_id: Joi.string().optional(),
        account_id: Joi.string().trim().required(),
        partner_id: Joi.string().trim().default(null),
        sub_category: Joi.object().min(1).required(),
        is_default: Joi.string().default('N'),
        description: Joi.string().trim().optional(),
        additional_info: Joi.object().optional(),
        process: Joi.string().trim().optional()
    };
    return Joi.object(validateObj);
};

const product = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        account_id: Joi.string().trim().required(),
        partner_id: Joi.string().trim().optional().default(null),
        category_id: Joi.string().trim().required(),
        sub_category_id: Joi.string().trim().required(),
        details: Joi.object().min(1).required(),
        additional_info: Joi.object().optional(), // locationId: city code need added in json
        is_active: Joi.string().default('N').optional()
    });
};

const address_information = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        user_id: Joi.number().required(),
        name: Joi.string().trim().required(),
        address: Joi.string().trim().required(),
        mobile: Joi.string().trim().required(),
        landline: Joi.string().trim().optional(),
        email: Joi.string().trim().optional(), // Optional
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        country: Joi.string().trim().optional(),
        pincode: Joi.string().trim().required(),
        landmark: Joi.string().trim().optional(), // Optional
        additional_info: Joi.object().optional(), // locationId: city code need added in json
        is_default: Joi.string().default('N').optional()
    });
};

const cart = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        account_id: Joi.string().trim().required(),
        user_id: Joi.string().trim().required(),
        products: Joi.object()
            .keys({
                items: Joi.array().items(Joi.object().keys({
                    id: Joi.number(),
                    attributes: Joi.object().optional(),
                    quantity: Joi.number()
                })).min(1).required()
            })
            .required(),
        additional_info: Joi.object().optional()
    });
};

const invoice = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        user_id: Joi.string().optional(),
        product_id: Joi.string().trim().default(null),
        account_id: Joi.string().trim().default(null),
        partner_id: Joi.string().trim().default(null),
        category_id: Joi.string().trim().default(null),
        sub_category_id: Joi.string().trim().default(null),
        address_info: Joi.object().min(1).required(),
        product_details: Joi.object().min(1).required(),
        delivery_type: Joi.string().trim().valid('brand', 'other').required(), // Brand or Other
        additional_info: Joi.object().optional(), // locationId: city code need added in json
        payment_method: Joi.string().trim().required(), // payment_method: [COD,UPI,Card]
        payment_status: Joi.string().trim().default(null),
        teams: Joi.string().trim().optional().allow(null).default(null) // Status [paid, cancelled, completed, refund]
    });
};

const order_detail = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        user_id: Joi.string().optional(),
        account_id: Joi.string().trim().allow(null).default(null),
        invoice_id: Joi.object().min(1).required(),
        partner_id: Joi.object().min(1).required(),
        payment_method: Joi.string().required(),
        delivery_charges: Joi.string().optional(),
        additionalInfo: Joi.object().optional()  // locationId: city code need added in json
    });
};

const order_track = () => {
    return Joi.object({
        order_id: Joi.string().required(),
        invoice_id: Joi.string().required(),
        status: Joi.string().trim().required(),
        link_to: Joi.string().trim().allow('').optional()
    });
};

const task_log = () => {
    return Joi.object({
        app_id: Joi.string().required(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().required().allow(null),
        invoice_id: Joi.string().required(),
        order_id: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().required(),
        user: Joi.object().optional(),
        details: Joi.object().optional(),
        status: Joi.string().required(),
        work_status: Joi.string().required(),
        link_to: Joi.string().optional().allow('')
    });
};

const template = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().required(),
        name: Joi.string().required(),
        type: Joi.string().required(), // costing / non costating
        is_active: Joi.string().valid('Y', 'N').optional(),
        is_deleted: Joi.string().valid('Y', 'N').optional()
    });
};


const templates_field = () => {
    return Joi.object({
        template_id: Joi.number().required(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().required(),
        catagory: Joi.string().required(),
        model: Joi.string().required(),
        label: Joi.string().required(),
        placeholder: Joi.string().required(),
        type: Joi.string().required(),
        model_type: Joi.string().required(),
        validation_type: Joi.string().required(),
        validations: Joi.object({
            validations: Joi.array().items(Joi.object({
                type: Joi.string(),
                params: Joi.array()
            })).optional()
        }),
        is_default: Joi.string().valid('Y', 'N').default('N'),
        readonly: Joi.string().required(),
        disabled: Joi.string().required(),
        required: Joi.string().required(),
        multiple: Joi.string().required(),
        link: Joi.object({
            is_link: Joi.string().valid('Y', 'N').default('N'),
            link_type: Joi.string().allow('').default(''),
            linked_to: Joi.string().allow('').default(''),
            link_property: Joi.object({
                isShow: Joi.string().valid('Y', 'N'),
                isShowvalue: Joi.string().allow('').default(''),
                value: Joi.object().default({})
            })
        }).optional(),
        values: Joi.object({ values: Joi.array() }).optional(),
        is_delete: Joi.string().valid('Y', 'N').default('N'),
        show_in_table: Joi.string().valid('Y', 'N').default('N'),
        filter_role: Joi.string().optional()
    });
};


const location_state = () => {
    return Joi.object({
        state_code: Joi.string().required(),
        state_name: Joi.string().required(),
        is_active: Joi.string().valid('Y', 'N').default('N')
    });
};


const location_city = () => {
    return Joi.object({
        id: Joi.string().optional(),
        city_name: Joi.string().required(),
        city_code: Joi.string().required(),
        state_code: Joi.string().required(),
        is_active: Joi.string().valid('Y', 'N').default('N'),
        is_popular: Joi.string().valid('Y', 'N').default('N')
    });
};


const market_place = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().allow('').required(),
        catagory_id: Joi.object({}).optional(),
        process: Joi.string().optional(),
        discription: Joi.string().allow('').optional(),
        is_default: Joi.string().valid('Y', 'N').default('N'),
        is_active: Joi.string().valid('Y', 'N').default('N')
    });
};

const market_place_nav = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        label: Joi.string().required(),
        value: Joi.string().required(),
        operation: Joi.object({}).optional(),
        app_id: Joi.string().optional()
    });
};

const document = () => {
    return Joi.object(
        {
            id: Joi.string().trim().optional(),
            file_name: Joi.string().required(),
            content_type: Joi.string().required(),
            file_path: Joi.string().required(),
            model: Joi.string().required()
        }
    );
};

const notification_type = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        name: Joi.string().required()                   //email,whatsapp,sms
    });
};


const vendor = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        type_id: Joi.number().integer().greater(0).required(),
        type_name: Joi.string().required(),
        vendor: Joi.string().required(),
        vendor_value: Joi.string().required(),                  //meta,twilio
        description: Joi.string().optional()
    });
};

const vendor_credential = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        account_id: Joi.string().required(),
        vendor_id: Joi.number().integer().greater(0).required(),
        details: Joi.object().required()
    });
};


const notification_template = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        account_id: Joi.string().required(),
        vendor_id: Joi.number().integer().greater(0).required(),
        template_name: Joi.string().required(),
        template_message: Joi.string().required(),
        subject: Joi.string().optional(),
        attachment: Joi.string().optional()
    });
};


const notification = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        account_id: Joi.string().required(),
        reciver: Joi.string().required(),
        staff_id: Joi.string().optional(),                // roles
        type_id: Joi.number().integer().greater(0).required(),
        template_id: Joi.number().integer().greater(0).required(),
        vendor_id: Joi.number().integer().greater(0).required(),
        model_id: Joi.number().integer().greater(0).required(),
        rules: Joi.object().required()
    });
};


const model = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        name: Joi.string().email().required()        //otp,product
    });
};

const notification_template_content = () => {
    return Joi.object({
        account_id: Joi.string().required(),
        id: Joi.number().integer().greater(0),
        template_id: Joi.number().integer().greater(0).required(),
        operation: Joi.object({}).optional()
    });
};

const custom_table_header = () => {
    return Joi.object({
        account_id: Joi.string().required(),
        id: Joi.number().integer().greater(0),
        header: Joi.object().min(1).required(),
        module: Joi.string().required(),
        user_id: Joi.number().integer().greater(0).required()
    });
};

const workflow_status = () => {
    return Joi.object({
        account_id: Joi.string().required(),
        page_type: Joi.string().required(),
        name: Joi.string().optional().default('').allow(''),
        app_id: Joi.string().allow('').required(),
        display_name: Joi.string().required(),
        status_name: Joi.string().required(),
        type: Joi.number().integer().required(),
        default_status: Joi.string().valid('Y', 'N').default('N').allow(''),
        color: Joi.string().allow(''),
        icon: Joi.string().allow(''),
        priority: Joi.number().integer().greater(0),
        link_to: Joi.string().allow('').optional(),
        link_type: Joi.string().allow('').optional(),
        content: Joi.object().optional().allow(null).default(null)
    });
};


const user = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        account_id: Joi.string().optional(),
        partner_id: Joi.string().allow(null).default(null),
        roles: Joi.string().valid('Superadmin','Admin','Employee','SubSuperadmin','SubAdmin','Client'),
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional().allow(''),
        email: Joi.string().email().optional(),
        phone_number: Joi.number().integer().greater(0).optional(),
        avatar_url: Joi.string(),
        user_group: Joi.number().optional(),
        auth: Joi.string().valid('Y','N').optional(),
        active: Joi.string().valid('Y','N').optional(),
        last_login: Joi.date().optional(),
        status: Joi.string().optional(),
        additional_info: Joi.object().optional()
    });
};

const project_account = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        product_limit: Joi.number().integer().greater(0).optional(),
        product_utilize: Joi.number().default(0).optional(),
        partner_utilize: Joi.number().default(0).optional()
    });
};

const partner_account = () => {
    return Joi.object({
        id: Joi.number().integer().greater(0),
        product_limit: Joi.number().integer().greater(0).optional(),
        product_utilize: Joi.number().default(0).optional(),
        account_license: Joi.string().valid('Y','N').optional()
    });
};

const flow_config = () => {
    return Joi.object({
        account_id: Joi.string().optional(),
        details: Joi.object({
            category_id: Joi.string().optional(),
            subcategory_id: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            order_by: Joi.string().valid('asc','desc').optional(),
            advance: Joi.array().items(Joi.object()).optional(),
            image: Joi.array().optional()
        }),
        flow_id: Joi.string().optional(),
        step_id: Joi.string().optional()
    });
};

const brand = () => {
    return Joi.object({
        id: Joi.number().optional(),
        account_id: Joi.string(),
        brand_name: Joi.string().required(),
        app_id: Joi.string().required(),
        category_id: Joi.string().required(),
        brand_verify: Joi.string().valid('Y','N').optional(),
        is_active: Joi.string().valid('Y','N').optional(),
        brand_des: Joi.string().optional()
    });
};

const attributes = () => {
    return Joi.object({
        id: Joi.number().optional(),
        attr_id: Joi.string().required(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        app_id: Joi.string().required(),
        category_id: Joi.string().required(),
        is_active: Joi.string().valid('Y', 'N').optional(),
        attr_value: Joi.string().optional(),
        units: Joi.string().optional().allow(null).allow('')
    });
};

const attributes_group = () => {
    return Joi.object({
        id: Joi.number().optional(),
        account_id: Joi.string().required(),
        name: Joi.string().required(),
        app_id: Joi.string().required(),
        category_id: Joi.string().required(),
        is_active: Joi.string().valid('Y','N').optional(),
        field: Joi.string().optional(),
        units: Joi.string().allow('').optional()
    });
};

const employeegroup = () => {
    return Joi.object({
        id: Joi.number().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        employee_master_id: Joi.string().required(),
        employee_id: Joi.string().required()
    });
};

const employee_master = () => {
    return Joi.object({
        id: Joi.number().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        name: Joi.string().required(),
        employee_id: Joi.object().optional(),
        team_leader: Joi.object().optional(),
        app_id: Joi.string().optional(),
        status: Joi.object().optional(),
        teams: Joi.string().optional()
    });
};

const crm_deals = () => {
    return Joi.object({
        id: Joi.number().optional(),
        contact_id: Joi.number().optional(),
        lead_id: Joi.string().trim().optional(),
        company_id: Joi.string().trim().optional(),
	    account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        details: Joi.object().optional(),
        user: Joi.object().optional(),
        is_active: Joi.string().default('Y')
    });
};

const crm_company = () => {
    return Joi.object({
        id: Joi.number().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        is_active: Joi.string().default('Y'),
        details: Joi.object().optional()
    });
};


const crm_activity = () => {
    return Joi.object({
        id: Joi.number().optional(),
        contact_id: Joi.string().optional(),
        lead_id: Joi.string().optional(),
        company_id: Joi.number().optional(),
        deal_id: Joi.number().optional(),
	    account_id: Joi.string().required(),
        type: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        details: Joi.object().optional(),
        is_active: Joi.string().default('Y')
    });
};


const crm_leads = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        company_id: Joi.string().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().optional().allow(null),
        details: Joi.object().optional(),
        phone_number: Joi.string().optional(),
        email: Joi.string().optional(),
        user: Joi.object().optional(),
        contact_details: Joi.object().default({}).optional(),
        is_lead: Joi.string().valid('Y','N').optional(),
        is_contact: Joi.string().valid('Y','N').optional(),
        associate_to_lead: Joi.string().optional()
    });
};

const crm_status = () => {
    const validateObj = {
        id: Joi.string().trim().optional(),
        account_id: Joi.string().trim().required(),
        partner_id: Joi.string().optional().allow(null),
        is_active: Joi.string().default('Y'),
        name: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        module: Joi.string().trim().required()
    };
    return Joi.object(validateObj);
};


const category_new = () => {
    const validateObj = {
        id: Joi.string().trim().optional(),
        name: Joi.string().trim().required(),
        app_id: Joi.string().optional(),
        account_id: Joi.string().trim().required(),
        is_active: Joi.string().default('Y'),
        description: Joi.string().trim().optional(),
        tax_details: Joi.object().optional(),
        details: Joi.object({
            icon: Joi.array().optional(),
            tags: Joi.array().optional()
        })
    };
    return Joi.object(validateObj);
};

const teams = () => {
    return Joi.object({
        id: Joi.string().trim().optional(),
        account_id: Joi.string().required(),
        partner_id: Joi.string().allow(null),
        name: Joi.string().required(),
        description: Joi.string().optional(),
        app_id: Joi.string().required(),
        is_active: Joi.string().default('Y')

    });
};

const import_documents = () => {
    return (
        Joi.object({
            id: Joi.number().integer().greater(0),
            account_id: Joi.string().required().default(null).allow(null),
            partner_id: Joi.string().default(null).allow(null),
            flag: Joi.string().optional(),
            details: Joi.object().required(),
            user: Joi.object().required(),
            created_by: Joi.string().default(null).allow(null),
            updated_by: Joi.string().default(null).allow(null),
            total_count: Joi.number().default(null).allow(null),
            completed_count: Joi.number().default(null).allow(null),
            skip_data_ref_id: Joi.string().default(null).allow(null),
            type: Joi.string().default('0'),
            created_at: Joi.string().optional(),
            updated_at: Joi.string().optional()
        })
    );
};

module.exports = {
    notification_type,
    model,
    notification,
    notification_template,
    vendor_credential,
    vendor,
    market_place_nav,
    document,
    product,
    address_information,
    cart,
    invoice,
    order_detail,
    order_track,
    task_log,
    category,
    template,
    templates_field,
    location_state,
    location_city,
    market_place,
    notification_template_content,
    custom_table_header,
    workflow_status,
    user,
    project_account,
    partner_account,
    flow_config,
    employeegroup,
    brand,
    attributes,
    attributes_group,
    employee_master,
    crm_deals,
    crm_company,
    crm_activity,
    crm_leads,
    crm_status,
    category_new,
    teams,
    import_documents
};
