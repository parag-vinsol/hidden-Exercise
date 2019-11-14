  class Product {
    constructor(jsonObject) {
    this.name = jsonObject["name"];
    this.url = jsonObject["url"];
    this.color = jsonObject["color"];
    this.brand = jsonObject["brand"];
    this.sold_out = jsonObject["sold_out"];
    }
  }
  class ProductGrid {
    constructor(jsonfilePath, filters) {
    this.jsonfilePath = jsonfilePath;
    this.filters = filters;
    this.productDiv = $("#products");
    this.filtersSelected = [];
    }
    init() {
    $.getJSON(this.jsonfilePath).done(this.loadJSONData).fail(this.loadingFailed);
    }
    loadJSONData = (data) => {
    this.jsonData = data;
    this.loadFilters();
    this.loadPage();
    }
    loadingFailed = () => {
    console.log("failed");
    }
    loadFilters = () => {
    this.filterDiv = $("#filters")
    this.filterProvided = new Set();
    this.filters.forEach(filterElement => {
        let uniqueFilter = [];
        let uniqueFilterForBoolean = [];
        this.jsonData.forEach(dataElement => {
        if(Object.keys(dataElement).indexOf(filterElement["filterName"]) > -1 && uniqueFilter.indexOf(dataElement[filterElement["filterName"]]) == -1 && filterElement["filterType"] == "multiple") {
            uniqueFilter.push(dataElement[filterElement["filterName"]]);
            this.filterProvided.add(filterElement["filterName"]);
        }
        else if(Object.keys(dataElement).indexOf(filterElement["filterName"]) > -1 && uniqueFilter.indexOf(dataElement[filterElement["filterName"]]) == -1 && filterElement["filterType"] == "boolean") {
            uniqueFilterForBoolean.push(filterElement["filterName"]);
        }
        })
        this.filterDiv.append($("<B />", {text: `${filterElement["filterName"]} Filters`}));
        uniqueFilter.forEach(element => {
        this.filterDiv.append($("<li />", {value: element, text: element}).append($("<input />",{type: "checkbox", "data-filterKind": filterElement["filterName"], "data-filterName": element, "data-filterType": filterElement["filterType"]})));
        })
        if(uniqueFilterForBoolean.length) {
        this.filterDiv.append($("<br>")).append($("<input />", {type: "checkbox", "data-filterType": filterElement["filterType"]})).append("Available Products");
        }
    });
    }
    loadPage = () => {
    this.filteredProduct = this.jsonData;
    this.displayProduct(this.filteredProduct, false);
    this.multipleFilters = $("[data-filterType='multiple']");
    this.booleanFilters = $("[data-filterType='boolean']");
    this.multipleFilters.click(this.filterOut);
    this.booleanFilters.click(this.filterAvailability);
    }
    filterOut = (event) => {
    let checkBox = $(event.target);
    let filterAlreadyPresent = 0;
    let filterKind = [];
    this.filteredProduct = this.jsonData;
    for (let i = 0; i < this.filtersSelected.length; i++) {
        if(this.filtersSelected[i].data("filtername") == checkBox.data("filtername")) {
        this.filtersSelected.splice(i, 1);
        i--;
        filterAlreadyPresent = 1;
        }
    }
    if(!filterAlreadyPresent) {
        this.filtersSelected.push(checkBox);
    }
    this.seperateFiltersBasedOnKind();
    this.totalFiters.forEach(element => {
        if(element.length) {
        this.ProductsBasedOnFilters(element, this.filteredProduct);
        }
    });
    this.displayProduct(this.filteredProduct, this.booleanFilters.is(":checked"));
    }
    seperateFiltersBasedOnKind = () => {
    this.totalFiters = [];
    this.filterProvided.forEach(element => {
        let oneTypeOfFilters = []
        this.filtersSelected.forEach(filterElement => {
        if(element == filterElement.data("filterkind")) {
            oneTypeOfFilters.push(filterElement.data("filtername"))
        }
        });
        this.totalFiters.push(oneTypeOfFilters);
    });
    }
    ProductsBasedOnFilters = (filters, products) => {
    let tempProducts = [];
    filters.forEach(filterElement => {
        products.forEach(productElement => { 
        if(Object.values(productElement).indexOf(filterElement) != -1) {
            tempProducts.push(productElement);
        }
        });
    });
    this.filteredProduct = tempProducts;
    }
    filterAvailability = (event) => {
    this.displayProduct(this.filteredProduct, $(event.target).is(":checked"));
    }

    displayProduct = (filteredProduct, availabilityCheckbox) => {
    var products = []; 
        if(availabilityCheckbox) {
        for(let i = 0; i < filteredProduct.length; i++) {
            if(filteredProduct[i]["sold_out"] == "0") {
            products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
            }
        }
        }
        else {
        for(let i = 0; i < filteredProduct.length; i++) {
            products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
        }
        }
        this.productDiv.html(products);
    }
  }
$(document).ready(function() {
var productGrid = new ProductGrid("data/product.json",[{filterName: "color", filterType:"multiple"}, {filterName: "brand", filterType:"multiple"}, {filterName: "sold_out", filterType:"boolean"}]);
productGrid.init();
});
