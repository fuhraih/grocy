﻿var productsTable = $('#products-table').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ 'visible': false, 'targets': 7 },
		{ 'visible': false, 'targets': 8 },
		{ "type": "html-num-fmt", "targets": 3 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#products-table tbody').removeClass("d-none");
productsTable.columns.adjust().draw();
LoadImagesLazy();

$("#search").on("keyup", Delay(function()
{
	var value = $(this).val();
	if (value === "all")
	{
		value = "";
	}

	productsTable.search(value).draw();
}, 200));

$("#product-group-filter").on("change", function()
{
	var value = $("#product-group-filter option:selected").text();
	if (value === __t("All"))
	{
		value = "";
	}

	productsTable.column(productsTable.colReorder.transpose(6)).search(value).draw();
});

$("#clear-filter-button").on("click", function()
{
	$("#search").val("");
	$("#product-group-filter").val("all");
	productsTable.column(productsTable.colReorder.transpose(6)).search("").draw();
	productsTable.search("").draw();
	if ($("#show-disabled").is(":checked") || $("#show-only-in-stock").is(":checked"))
	{
		$("#show-disabled").prop("checked", false);
		$("#show-only-in-stock").prop("checked", false);
		RemoveUriParam("include_disabled");
		RemoveUriParam("only_in_stock");
		window.location.reload();
	}
});

if (typeof GetUriParam("product-group") !== "undefined")
{
	$("#product-group-filter").val(GetUriParam("product-group"));
	$("#product-group-filter").trigger("change");
}

$(document).on('click', '.product-delete-button', function(e)
{
	var objectName = $(e.currentTarget).attr('data-product-name');
	var objectId = $(e.currentTarget).attr('data-product-id');

	bootbox.confirm({
		message: __t('Are you sure to delete product "%s"?', objectName) + '<br><br>' + __t('This also removes any stock amount, the journal and all other references of this product - consider disabling it instead, if you want to keep that and just hide the product.'),
		closeButton: false,
		buttons: {
			confirm: {
				label: __t('Yes'),
				className: 'btn-success'
			},
			cancel: {
				label: __t('No'),
				className: 'btn-danger'
			}
		},
		callback: function(result)
		{
			if (result === true)
			{
				jsonData = {};
				jsonData.active = 0;
				Grocy.Api.Delete('objects/products/' + objectId, {},
					function(result)
					{
						window.location.href = U('/products');
					},
					function(xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

$("#show-disabled").change(function()
{
	if (this.checked)
	{
		UpdateUriParam("include_disabled", "true");
	}
	else
	{
		RemoveUriParam("include_disabled");
	}

	window.location.reload();
});

$("#show-only-in-stock").change(function()
{
	if (this.checked)
	{
		UpdateUriParam("only_in_stock", "true");
	}
	else
	{
		RemoveUriParam("only_in_stock");
	}

	window.location.reload();
});

if (GetUriParam('include_disabled'))
{
	$("#show-disabled").prop('checked', true);
}


$(".merge-products-button").on("click", function(e)
{
	var productId = $(e.currentTarget).attr("data-product-id");
	$("#merge-products-keep").val(productId);
	$("#merge-products-remove").val("");
	$("#merge-products-modal").modal("show");
});

$("#merge-products-save-button").on("click", function(e)
{
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("merge-products-form", true))
	{
		return;
	}

	var productIdToKeep = $("#merge-products-keep").val();
	var productIdToRemove = $("#merge-products-remove").val();

	Grocy.Api.Post("stock/products/" + productIdToKeep.toString() + "/merge/" + productIdToRemove.toString(), {},
		function(result)
		{
			window.location.href = U('/products');
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.ShowGenericError('Error while merging', xhr.response);
		}
	);
});

$(document).on("click", "#print-products-list-button", function(e)
{
	$(".print-timestamp").text(moment().format("l LT"));
	window.print();
});
