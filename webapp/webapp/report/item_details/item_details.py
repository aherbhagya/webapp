# Copyright (c) 2013, Digitalprizm and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data()
	# data = get_data(filters)



def  get_colums():
	columns =["Item Name:Data:110"]+ ["Item Code:Data:110"]\
	 +["Item Group:Data:110"] +["UOM:Data:100"]

	return columns

def get_data():
	query = """ select item_name, item_code, item_group, stock_uom from tabItem"""


	dl = frappe.db.sql(query,as_list=1,debug=1)
	return dl