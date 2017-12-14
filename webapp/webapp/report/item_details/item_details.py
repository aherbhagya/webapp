# Copyright (c) 2013, Digitalprizm and contributors
# For license information, please see license.txt
import frappe
from frappe.utils import flt, getdate, cstr
from frappe import msgprint, _
from operator import itemgetter
from itertools import groupby
import operator

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_data(filters)

	return columns, data

def  get_columns():
	columns =["Item Name:Data:110"]+ ["Item Code:Data:110"]\
	 +["Item Group:Data:110"] +["UOM:Data:100"]

	return columns

def get_data(filters):
	query = """ select item_name, item_code, item_group,\
	 stock_uom from tabItem where item_group='{0}'""".format(filters.get("item_group"))


	dl = frappe.db.sql(query,as_list=1,debug=1)
	return dl