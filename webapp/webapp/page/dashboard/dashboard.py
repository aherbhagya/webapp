from __future__ import unicode_literals
import frappe
from frappe.utils import cstr,now,add_days
import json
import datetime




@frappe.whitelist()
def get_customer():
	query = """SELECT `customer_name`,`customer_type`, `customer_group`, `territory`
			 from 
			 	`tabCustomer`"""
	batch = frappe.db.sql(query, as_dict=1)
	for batch_details in batch:
		if batch_details.get('size'):
			batch_details[batch_details.get('size')] = batch_details.get('multiplication_factor')

	return batch