frappe.provide('webapp');
/*frappe.pages['dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Dashboard',
		single_column: true
	});
}*/


frappe.pages['dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Dashboard',
		single_column: true
	});

	/*new webapp.Dashboard(wrapper, page);*/
	wrapper.dashboard = new webapp.Dashboard(wrapper);
	frappe.breadcrumbs.add("Dashboard");

	var html = frappe.render_template("dashboard", {"data":"this is encripted data"})
	$(html).appendTo($(wrapper).find('.layout-main'));

	$("div.bhoechie-tab-menu>div.list-group>a").click(function(e) {
		e.preventDefault();
		$(this).siblings('a.active').removeClass("active");
		$(this).addClass("active");
		var index = $(this).index();
		$("div.bhoechie-tab>div.bhoechie-tab-content").removeClass("active");
		$("div.bhoechie-tab>div.bhoechie-tab-content").eq(index).addClass("active");
	});
}

webapp.Dashboard = Class.extend({
	init: function(wrapper) {
		var me = this;
		this.setup(wrapper);
    frappe.call({
     method: "webapp.webapp.page.dashboard.dashboard.get_customer",
     callback: function(r) {
        //position of dashboard
        $(".layout-main-section-wrapper").css("margin-bottom","0");
        //regular tab
        $(".btn-pref .btn").click(function () {
          $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
          // $(".tab").addClass("active"); // instead of this do the below 
          $(this).removeClass("btn-default").addClass("btn-primary");   
        });
        
        function requiredFieldValidator(value) {
          if (value == null || value == undefined || !value.length) {
            return {valid: false, msg: "This is a required field"};
          } else {
            return {valid: true, msg: null};
          }
        }

        var grid;
        var data = [];
        var columns = [
                 {id: "customer_name", name: "Ful Name", field: "customer_name", width: 155, 
                 formatter: linkFormatter = function ( row, cell, value, columnDef, dataContext ) {
                   return '<a href="desk#Form/Customer/' + dataContext['name'] + '">' + value + '</a>';
                 },
                 cssClass: "cell-title", validator: requiredFieldValidator},
                 {id: "customer_type", name: "Customer Type", field: "customer_type", width: 155},
                 {id: "customer_group", name: "Customer Group", field: "customer_group", width: 160},
          //{id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false},
          {id: "territory", name: "Territory", field: "territory", minWidth: 155},
          //{id: "delCol", field:'del', name:'Edit', width:150, formatter:editbuttonFormatter},
          ];

          function editbuttonFormatter(row,cell,value,columnDef,dataContext){
            var i=0;
            var button = "<a class='btn-xs btn-info del' id='del_"+row+"'><em class='icon-edit'></em></a>";
            return button;
          }
          function buttonFormatter(row,cell,value,columnDef,dataContext){
            var i=0;
            var button = "<a class='btn-xs btn-danger del' id='del_"+row+"'><em class='icon-remove'></em></a>";
            return button;
          }

          var options = {
            editable: true,
            enableColumnReorder : true,
            enableAddRow: true,
            explicitInitialization: true,
            enableCellNavigation: true,
            asyncEditorLoading: false,
          // showHeaderRow: true,
          // headerRowHeight: 30,
          autoEdit: false
        };

        $(function() {
          $.each(r.message, function(i, item) {
            var d = (data[i] = {});
            d["id"] = i+1,
            d["customer_name"] = item.customer_name;
            d["customer_type"] = item.customer_type;
            d["customer_group"] = item.customer_group;
            d["territory"] = item.territory;
            d["name"] = item.name;
            i = i+1;
          });
        });

        setTimeout(function() { 
          // grid = new Slick.Grid("#myGrid", data, columns, options);
          // grid.setSelectionModel(new Slick.CellSelectionModel());

          // grid.onAddNewRow.subscribe(function (e, args) {
          //   var item = args.item;
          //   grid.invalidateRow(data.length);
          //   data.push(item);
          //   grid.updateRowCount();
          //   grid.render();
          // });
    //filter
    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#customerGrid", dataView, columns, options);  
    //var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
   // for row header filters
   var columnFilters = []
   function filter(item) {
    for (var columnId in columnFilters) {
      if (columnId !== undefined && columnFilters[columnId] !== "") {
        var c = grid.getColumns()[grid.getColumnIndex(columnId)];
        if (item[c.field] != columnFilters[columnId]) {
          return false;
        }
      }
    }
    return true;
  }  

  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
    var columnId = $(this).data("columnId");
    if (columnId != null) {
      columnFilters[columnId] = $.trim($(this).val());
      dataView.refresh();
    }
  });

  grid.onHeaderRowCellRendered.subscribe(function(e, args) {
    $(args.node).empty();
    $("<input type='text'>")
    .data("columnId", args.column.id)
    .val(columnFilters[args.column.id])
    .appendTo(args.node);
  });

  grid.init();
  dataView.setFilter(filter);
  dataView.beginUpdate();
  dataView.setItems(data);
  dataView.endUpdate();
      //end filter
      


},500);

        //graph charts
        var chart1 = c3.generate({
          bindto: '#chart-content_1',
          data: {
            columns: [
            ['data1', 100, 200, 150, 300, 200],
            ['data2', 400, 500, 250, 700, 300],
            ]
          }
        });

        chart1.resize({height:300, width:800})
          //
          frappe.call({
            method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.get_doctor_count",
            async: true,
            callback: function(r) {
              //console.log(r);
              var chart = c3.generate({
                bindto: '#chart-content_2',
                data: {
                      // iris data from R
                      columns: [
                      ['Active', r.message[0]],
                      ['Inactive', r.message[1]],
                      ],
                      type : 'pie',
                      onclick: function (d, i) { console.log("onclick", d, i); },
                      onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                      onmouseout: function (d, i) { console.log("onmouseout", d, i); }
                    }
                  });

            }
          });
        }
      });

    //surgeon grid
    var data = []; 
    frappe.call({
      method: "webapp.webapp.page.dashboard.dashboard.get_customer",
      async:true,
      callback: function(r) {

          $(function() {
            $.each(r.message, function(i, item) {
              //console.log(item);
              var d = (data[i] = {});
              d["id"] = i+1,
              d["customer_name"] = item.customer_name;
              d["customer_type"] = item.customer_type;
              d["customer_group"] = item.customer_group;
              d["territory"] = item.territory;
              i = i+1;
              // console.log(item,"in data")
            });
          });
        //console.log(data);
        setTimeout(function(){ 
            var html = frappe.render_template("table_customer", {"data":data})
            $("#customerGrid").html(html);

            frappe.require(['/assets/webapp/js/jquery.dataTables.min.js',
              '/assets/webapp/js/jquery.dataTables.min.css', 
              '/assets/webapp/js/dataTables.responsive.js', 
              '/assets/webapp/js/responsive.dataTables.css'], function() {
              /*$('#patientTable').DataTable();*/
              $('#customerTable').DataTable( {
                  responsive: true
              });
            });
          },500);
     }
  });
    //surgeon grid

//patient grid
    var data = []; 
    frappe.call({
      method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.get_patient",
      async:true,
      callback: function(r) {

          $(function() {
            $.each(r.message, function(i, item) {
              var d = (data[i] = {});
              d["id"] = i+1,
              d["first_name"] = item.first_name;
              d["last_name"] = item.last_name;
              d["email"] = item.email;
              d["mobile_no"] = item.mobile_no;
              d["name"] = item.name;
              i = i+1;
            });
          });
        //console.log(data);
        setTimeout(function(){ 
            var html = frappe.render_template("table_data_patient", {"data":data})
            console.log(html,"htmll patient");
            $("#patientGrid").html(html);
             

            frappe.require(['/assets/clinic_management/js/jquery.dataTables.min.js',
              '/assets/clinic_management/js/jquery.dataTables.min.css', 
              '/assets/clinic_management/js/dataTables.responsive.js', 
              '/assets/clinic_management/js/responsive.dataTables.css'], function() {
              /*$('#patientTable').DataTable();*/
              $('#patientTable').DataTable( {
                  responsive: true
              });
            });
          },500);
     }
  });
//end of patient grid

//case grid
    var case_data = []; 
    frappe.call({
      method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.get_case",
      async:true,
      callback: function(r) {

          $(function() {
            $.each(r.message, function(i, item) {
              var d = (case_data[i] = {});
              d["id"] = i+1,
              d["hospital"] = item.hospital;
              d["surgeon"] = item.surgeon;
              d["doctor"] = item.doctor;
              d["name"] = item.name;
              d["case_no"] = item.case_no;
              d["procedure_type"] = item.procedure_type;              
              d["operation_type"] = item.operation_type;              
              i = i+1;
            });
          });
        console.log(case_data,"case data");
        setTimeout(function(){ 
            var html = frappe.render_template("table_data_case", {"data":case_data})
            $("#caseGrid").html(html);
             
            frappe.require(['/assets/clinic_management/js/jquery.dataTables.min.js',
              '/assets/clinic_management/js/jquery.dataTables.min.css', 
              '/assets/clinic_management/js/dataTables.responsive.js', 
              '/assets/clinic_management/js/responsive.dataTables.css'], function() {
              /*$('#patientTable').DataTable();*/
              $('#caseTable').DataTable( {
                  responsive: true
              });
            });
          },500);
     }
  });
//end of case grid

    //hospital grid
    var data = []; 
    frappe.call({
      method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.get_hospital",
      async:true,
      callback: function(r) {

          $(function() {
            $.each(r.message, function(i, item) {
              //console.log(item);
              var d = (data[i] = {});
              d["id"] = i+1,
              d["first_name"] = item.clinic_name;
              d["registration_no"] = item.registration_no;
              d["clinic_name"] = item.clinic_name;
              d["mobile_no"] = item.mobile_no;
              d["name"] = item.name;
              i = i+1;
              console.log(item,"in hospitaldata")
            });
          });
        //console.log(data);
        setTimeout(function(){ 
            var html = frappe.render_template("table_data_hospital", {"data":data})
            $("#hospGrid").html(html);

            frappe.require(['/assets/clinic_management/js/jquery.dataTables.min.js',
              '/assets/clinic_management/js/jquery.dataTables.min.css', 
              '/assets/clinic_management/js/dataTables.responsive.js', 
              '/assets/clinic_management/js/responsive.dataTables.css'], function() {
              /*$('#patientTable').DataTable();*/
              $('#hospitalTable').DataTable( {
                  responsive: true
              });
            });
          },500);
     }
  });
    //hospital grid
  },
  setup: function(wrapper) {
    var me = this;

    this.elements = {
     layout: $(wrapper).find(".addDoctor"),
     add_doctor:  wrapper.page.add_field({
      fieldname: "add_customer",
      label: __("Add Customer"),
      fieldtype: "Button",
      icon: "icon-upload"
    })
   };

   var d = new frappe.ui.Dialog({
    title: __("Add Customer"),
    fields: [
        {
          "label": __("First Name"), 
          "fieldname": "first_name",
          "fieldtype": "Data", 
          "reqd": 1
        },
        {
          "label": __("Last Name"), 
          "fieldname": "last_name",
          "fieldtype": "Data", 
          "reqd": 1
        },
        {
          "label": __("Gender"), 
          "fieldname": "gender",
          "fieldtype": "Select", 
          "options":["Male","Female"]
        },
        {
          "label": __("Email"), 
          "fieldname": "email",
          "fieldtype": "Data", 
          "reqd": 1
        },
        {
          "fieldname":"cb1",
          "fieldtype":"Column Break",
        },
        {
          "label": __("Mobile No."), 
          "fieldname": "mobile_no",
          "fieldtype": "Data", 
        },
        
        {
          "label": __("Image"), 
          "fieldname": "image",
          "fieldtype": "Attach Image", 
        },
        {
          "label": __("Disabled"), 
          "fieldname": "disabled",
          "fieldtype": "Check", 
        },
        {
          "fieldname":"sb1",
          "fieldtype":"Section Break",
        },
        ],
        primary_action_label: "Save",
        primary_action: function(){
         //msgprint("hi");
         args = d.get_values();
         if(!args) return;
         console.log(args);
         frappe.call({
          method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_doctor",
          args: {
            "first_name": args.first_name,
            "last_name": args.last_name,
            "gender":args.gender,
            "email": args.email,
            "contact_no":args.contact_no,
            "mobile_no": args.mobile_no,
            "image":args.image,
            "disabled":args.disabled,
            "address":args.address,
            "country":args.country,
            "postal_code":args.postal_code,
          },  
          callback: function(r) {
            msgprint("Doctor added")
          }
        });
         d.hide();
       }
     });

this.elements.add_doctor.$input.on("click", function() {
      // me.get_data(this);
      d.show();
    });

d.fields_dict.mobile_no.$input.mouseout(function(e){
  args = d.get_values();
  console.log("len-------",args.mobile_no.length)
  if (args.mobile_no.length != 10){
    msgprint("should be 10 digits");
    return false
  }
  return true
});

d.fields_dict.mobile_no.$input.keydown(function(e){

  if (e.which>31 && (e.which < 48 || e.which > 57))
  {
    e.preventDefault();
  }

});
d.fields_dict.email.$input.mouseout(function(e){
      //args = d.get_values();
      var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (reg.test(d.get_values().email) == false) 
      {
        msgprint('Invalid Email Address');
        return false;
      }
      return true;
    });

    this.elements = {
      layout: $(wrapper).find(".addSupplier"),
      add_surgeon:  wrapper.page.add_field({
        fieldname: "add_supplier",
        label: __("Add Supplier"),
        fieldtype: "Button",
        icon: "icon-upload"
      })
    };

    var s = new frappe.ui.Dialog({
      title: __("Add Supplier"),
      fields: [
      {
        "label": __("First Name"), 
        "fieldname": "first_name",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "label": __("Last Name"), 
        "fieldname": "last_name",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "label": __("Gender"), 
        "fieldname": "gender",
        "fieldtype": "Select", 
        "options":["Male","Female"]
      },
      {
        "label": __("Email"), 
        "fieldname": "email",
        "fieldtype": "Data", 
        "reqd": 1
      },
        /*{
          "label": __("Date Of Joining"), 
          "fieldname": "doj",
          "fieldtype": "Date", 
          "reqd": 1,
          "default": get_today()
        },*/
        {
          "label": __("Contact No."), 
          "fieldname": "contact_no",
          "fieldtype": "Int", 
        },
        {
          "fieldname":"cb1",
          "fieldtype":"Column Break",
        },
        {
          "label": __("Mobile No."), 
          "fieldname": "mobile_no",
          "fieldtype": "Data", 
        },
        
        {
          "label": __("Image"), 
          "fieldname": "image",
          "fieldtype": "Attach Image", 
        },
        {
          "label": __("Disabled"), 
          "fieldname": "disabled",
          "fieldtype": "Check", 
        },
        {
          "fieldname":"sb1",
          "fieldtype":"Section Break",
        },
        {
          "label": __("Address"), 
          "fieldname": "address",
          "fieldtype": "Small Text", 
        },
        {
          "fieldname":"cb2",
          "fieldtype":"Column Break",
        },
        {
          "label": __("Counrty"), 
          "fieldname": "country",
          "fieldtype": "Data", 
        },
        {
          "label": __("Postal Code"), 
          "fieldname": "postal_code",
          "fieldtype": "Int", 
        },
        /*{
          "fieldtype": "Button",
          "fieldname": "save_surgeon",
          "label": __("Save")
        }*/
        ],
        primary_action_label: "Save",
        primary_action: function(){
         //msgprint("hi");
         args = s.get_values();
         if(!args) return;
         console.log(args);
         frappe.call({
          method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_surgeon",
          args: {
            "first_name": args.first_name,
            "last_name": args.last_name,
            "gender":args.gender,
            "email": args.email,
            "contact_no":args.contact_no,
            "mobile_no": args.mobile_no,
            "image":args.image,
            "disabled":args.disabled,
            "address":args.address,
            "country":args.country,
            "postal_code":args.postal_code,
          },  
          callback: function(r) {
          }
        });
         s.hide();
       }
     });

this.elements.add_surgeon.$input.on("click", function() {
      // me.get_data(this);
      s.show();
    });

s.fields_dict.mobile_no.$input.mouseout(function(e){
  args = s.get_values();
  console.log("len-------",args.mobile_no.length)
  if (args.mobile_no.length != 10){
    msgprint("should be 10 digits");
    return false
  }
  return true
});

s.fields_dict.mobile_no.$input.keydown(function(e){

  if (e.which>31 && (e.which < 48 || e.which > 57))
  {
    e.preventDefault();
  }

});
s.fields_dict.email.$input.mouseout(function(e){
      //args = d.get_values();
      var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (reg.test(s.get_values().email) == false) 
      {
        msgprint('Invalid Email Address');
        return false;
      }
      return true;
    });


    //patient dialogue
    this.elements = {
      layout: $(wrapper).find(".addItem"),
      add_patient:  wrapper.page.add_field({
        fieldname: "add_item",
        label: __("Add Item"),
        fieldtype: "Button",
        icon: "icon-upload"
      })
    };

    var p = new frappe.ui.Dialog({
      title: __("Add Item"),
      fields: [
      {
        "label": __("First Name"), 
        "fieldname": "first_name",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "label": __("Last Name"), 
        "fieldname": "last_name",
        "fieldtype": "Data", 
        "reqd": 1
      },

      {
        "label": __("Gender"), 
        "fieldname": "gender",
        "fieldtype": "Select", 
        "options":["Male","Female"],
        "reqd": 1
      },

      {
        "label": __("Email"), 
        "fieldname": "email",
        "fieldtype": "Data", 
      },

      {
        "label": __("Mobile No"), 
        "fieldname": "mobile_no",
        "fieldtype": "Data", 
      },
      {
        "fieldname":"cb1",
        "fieldtype":"Column Break",
      },
      {
        "fieldname": "case_no1",
        "fieldtype": "Data", 
      },
      {
        "label": __("Contact No"), 
        "fieldname": "contact_no",
        "fieldtype": "Int", 
      },
      {
        "label": __("Address"), 
        "fieldname": "address",
        "fieldtype": "Data", 
      },
      {
        "label": __("Counrty"), 
        "fieldname": "country",
        "fieldtype": "Data", 
      },
      {
        "label": __("Postal Code"), 
        "fieldname": "postal_code",
        "fieldtype": "Int", 
      },
        /*{
          "fieldtype": "Button",
          "fieldname": "save_patient",
          "label": __("Save")
        }*/
        ],
        primary_action_label: "Save",
        primary_action: function(){
         //msgprint("hi");
         args = p.get_values();
         if(!args) return;
         console.log(args);
         frappe.call({
          method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_patient",
          args: {
            "first_name": args.first_name,
            "last_name": args.last_name,
            "gender":args.gender,
            "email": args.email,
            "mobile_no": args.mobile_no,
            "contact_no":args.contact_no,
            "address":args.address,
            "country":args.country,
            "postal_code":args.postal_code,
          },  
          callback: function(r) {
          }
        });
         p.hide()

       }
     });


this.elements.add_patient.$input.on("click", function() {
      // me.get_data(this);
      p.show();
    });

    /*p.fields_dict.save_patient.$input.click(function() {
      args = p.get_values();
      if(!args) return;
      //console.log(args);
      frappe.call({
        method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_patient",
        args: {
          "first_name": args.first_name,
          "last_name": args.last_name,
          "gender":args.gender,
          "email": args.email,
          "mobile_no": args.mobile_no,
          "contact_no":args.contact_no,
          "address":args.address,
          "country":args.country,
          "postal_code":args.postal_code
        },  
        callback: function(r) {
        }
      });
      p.hide()
    });*/

    //patient dialogue


    //hospitalmanagement dialogue
    this.elements = {
      layout: $(wrapper).find(".addLead"),
      add_hospital:  wrapper.page.add_field({
        fieldname: "add_lead",
        label: __("Add Lead"),
        fieldtype: "Button",
        icon: "icon-upload"
      })
    };

    var lead = new frappe.ui.Dialog({
      title: __("Add Lead"),
      fields: [
      {
        "label": __("Hospital Name"), 
        "fieldname": "clinic_name",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "fieldname":"cb1",
        "fieldtype":"Column Break",
      },
      {
        "label": __("Registration No"), 
        "fieldname": "registration_no",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "fieldname":"sb1",
        "fieldtype":"Section Break",
      },
      {
        "label": __("Address"), 
        "fieldname": "address",
        "fieldtype": "Small Text", 
        "reqd": 1
      },
      {
        "fieldname":"cb2",
        "fieldtype":"Column Break",
      },
      {
        "label": __("Postal Code"), 
        "fieldname": "postal_code",
        "fieldtype": "Int", 
      },

      {
        "label": __("Country"), 
        "fieldname": "country",
        "fieldtype": "Data", 
      },
      {
        "fieldname":"sb2",
        "fieldtype":"Section Break",
      },
      {
        "label": __("Email"), 
        "fieldname": "email",
        "fieldtype": "Data", 
      },
      {
        "label": __("Contact No"), 
        "fieldname": "contact_no",
        "fieldtype": "Int", 
      },
      {
        "label": __("Mobile No"), 
        "fieldname": "mobile_no",
        "fieldtype": "Data", 
      },
      {
        "fieldname":"cb2",
        "fieldtype":"Column Break",
      },
      {
        "label": __("Logo Image"), 
        "fieldname": "logo_image",
        "fieldtype": "Attach Image", 
      },
        /*{
          "fieldtype": "Button",
          "fieldname": "save_hospital",
          "label": __("Save")
        }*/
        ],
        primary_action_label: "Save",
        primary_action: function(){
        // msgprint("hi");
        args = hospital.get_values();
        if(!args) return;
        console.log(args);
        frappe.call({
          method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_hospital",
          args: {
            "clinic_name":args.clinic_name,
            "registration_no":args.registration_no,
            "address":args.address,
            "postal_code":args.postal_code,
            "console":args.country,
            "email": args.email,
            "contact_no":args.contact_no,
            "mobile_no": args.mobile_no,
            "logo_image":args.logo_image,

          },  
          callback: function(r) {
          }
        });
        hospital.hide()

      }
    });

this.elements.add_hospital.$input.on("click", function() {
      // me.get_data(this);
      hospital.show();
    });


    /*hospital.fields_dict.save_hospital.$input.click(function() {
      args = hospital.get_values();
      if(!args) return;
      frappe.call({
        method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_hospital",
        args: {
          "clinic_name":args.clinic_name,
          "registration_no":args.registration_no,
          "address":args.address,
          "postal_code":args.postal_code,
          "console":args.country,
          "email": args.email,
          "contact_no":args.contact_no,
          "mobile_no": args.mobile_no,
          "logo_image":args.logo_image,
          
        },  
        callback: function(r) {
        }
      });
      hospital.hide()
    });*/
    //hospitalmanagement dialogue

    

    this.elements = {
      layout: $(wrapper).find(".addCompany"),
      add_company:  wrapper.page.add_field({
        fieldname: "add_company",
        label: __("Add Company"),
        fieldtype: "Button",
        icon: "icon-upload"
      })
    };

    var comp = new frappe.ui.Dialog({
      title: __("Add Company"),
      fields: [
      {
        "label": __("Company Name"), 
        "fieldname": "company",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "label": __("GST (Tax)"), 
        "fieldname": "gst",
        "fieldtype": "Select",
        "options":["Yes","No"], 
      },
      {
        "label": __("Company Registration No"), 
        "fieldname": "comp_reg_no",
        "fieldtype": "Data", 
        "reqd": 1
      },
      {
        "fieldname":"cb1",
        "fieldtype":"Column Break",
      },
      {
        "label": __("Logo Image"), 
        "fieldname": "company_logo",
        "fieldtype": "Attach Image", 
      },
      {
        "fieldname":"sb2",
        "fieldtype":"Section Break",
      },
      {
        "label": __("Doctor"), 
        "fieldname": "doctor",
        "fieldtype": "Link", 
        "options":"Doctor"
      },
      {
        "label": __("Phone No"), 
        "fieldname": "mobile_no",
        "fieldtype": "Data", 
      },
      {
        "label": __("Contact No"), 
        "fieldname": "contact_no",
        "fieldtype": "Int", 
      },
      {
        "label": __("Email"), 
        "fieldname": "email",
        "fieldtype": "Data", 
      },
      {
        "fieldname":"cb2",
        "fieldtype":"Column Break",
      },
      {
        "label": __("Website"), 
        "fieldname": "website",
        "fieldtype": "Data", 
      },
      {
        "label": __("Address"), 
        "fieldname": "address",
        "fieldtype": "Data", 
      },
      {
        "label": __("Postal Code"), 
        "fieldname": "postal_code",
        "fieldtype": "Int", 
      },
      {
        "label": __("Counrty"), 
        "fieldname": "country",
        "fieldtype": "Data", 
      },

        /*{
          "fieldtype": "Button",
          "fieldname": "save_comp",
          "label": __("Save")
        }*/
        
        ],
        primary_action_label: "Save",
        primary_action: function(){
         //msgprint("hi");
         args = comp.get_values();
         if(!args) return;
         frappe.call({
          method: "clinic_management.clinic_management.page.dashboard_1.dashboard_1.save_company",
          args: {
            "company":args.company,
            "gst":args.gst,
            "comp_reg_no":args.comp_reg_no,
            "logo_image":args.logo_image,
            "doctor":args.doctor,
            "contact_no":args.contact_no,
            "mobile_no":args.mobile_no,
            "email":args.email,
            "website":args.website,
            "address":args.address,
            "postal_code":args.postal_code,
            "country":args.country          
          },  
          callback: function(r) {
          }
        });
         comp.hide()
       }
     });

this.elements.add_company.$input.on("click", function() {
      // me.get_data(this);
      comp.show();
    });


}

});