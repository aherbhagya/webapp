// Copyright (c) 2016, Digitalprizm and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Item Details"] = {
	"filters": [
					{
						"fieldname":"item_group",
						"label": __("Item Group"),
						"fieldtype": "Link",
						"options": "Item Group",
					},
	]
}
