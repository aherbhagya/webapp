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

	wrapper.dashboard_1 = new webapp.Dashboard(wrapper);
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