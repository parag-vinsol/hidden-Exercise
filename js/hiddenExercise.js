class ProductGrid {
  constructor(colorDivId, brandDivId, productDivId, toggleButtonDivId, jsonFilePath) {
    this.colorDiv = $(colorDivId);
    this.brandDiv = $(brandDivId);
    this.productDiv = $(productDivId);
    this.availableProductButtonDiv = $(toggleButtonDivId);
    this.jsonFilePath = jsonFilePath;
    this.filteredProduct = [];
    this.filters = [];
    this.firsrFilteredResult = [];
  }
  init = () => {
    $.getJSON(this.jsonFilePath).done(this.loadJSONData).fail(this.loadFailMessage);
  }
  loadJSONData = (data) => {
    this.jsonData = data;
    this.loadPage();
  }
  loadFailMessage = () => {
    this.productDiv.html("Page can't be loaded");
  }
  loadPage() {
    let uniqueColor = [];
    let uniqueBrands = [];
    for(let i = 0; i < this.jsonData.length; i++) {
      if(uniqueColor.indexOf(this.jsonData[i]["color"]) == -1) {
        uniqueColor.push(this.jsonData[i]["color"]);
      }
      if(uniqueBrands.indexOf(this.jsonData[i]["brand"]) == -1) {
        uniqueBrands.push(this.jsonData[i]["brand"]);
      }
      this.filteredProduct = this.jsonData;
      this.displayProducts(this.filteredProduct, false);
    }
    for(let i = 0; i < uniqueColor.length; i++) {
      let listOfColors = $("<li />",{color: uniqueColor[i],text: uniqueColor[i]}).append($("<input />", {type: "checkbox","data-checkboxKind": "filter", "data-kind": "color", "data-color": uniqueColor[i]}));
      this.colorDiv.append(listOfColors);
    }
    for(let i = 0; i < uniqueBrands.length; i++) {
      let listOfBrands = $("<li />",{brand: uniqueBrands[i], text: uniqueBrands[i]}).append($("<input />", {type: "checkbox","data-checkboxKind": "filter", "data-kind": "brand", "data-brand": uniqueBrands[i]}));
      this.brandDiv.append(listOfBrands);
    }
    this.availableProductButtonDiv.append($("<input />",{type: "checkbox",value: "Available Products", "data-checkboxKind": "Availability", "data-button":"available Products"})).append("Available Products");
    $("[data-checkboxKind='filter']").click(this.filterOut);
    this.availableProductButtonDiv.find("[data-checkboxKind='Availability']").click(this.showAvailableProducts);
  }
  filterOut = (event) => {
    let checkedBox = $(event.target);
    this.filters.push(checkedBox);
    let brandFilterSet = new Set();
    let colorFilterSet = new Set();
    let brandFilter = [];
    let colorFilter =[];
    this.filteredProduct=[];
    this.firsrFilteredResult=[]; 
    for(let i = 0; i < this.filters.length; i++) {
      if(this.filters[i].is(":checked") && this.filters[i].data("kind") == "color" && this.filters.indexOf(this.filters[i].data("color")) == -1) {
        colorFilterSet.add(this.filters[i].data("color"));
      }  
      else if(this.filters[i].is(":checked") && this.filters[i].data("kind") == "brand" && this.filters.indexOf(this.filters[i].data("brand")) == -1) {
        brandFilterSet.add(this.filters[i].data("brand"));
      }
    }
    brandFilter = Array.from(brandFilterSet);
    colorFilter = Array.from(colorFilterSet);
    if(colorFilter.length) {
      for(let i = 0; i < colorFilter.length; i++) {
        for(let j = 0; j < this.jsonData.length;j++) {
          if(colorFilter[i] == this.jsonData[j]["color"]) {
            this.firsrFilteredResult.push(this.jsonData[j]);
          }
        }
      }
    }
    else if(!colorFilter.length) {
      for(let i= 0; i < brandFilter.length; i++) {
        for(let j = 0; j < this.jsonData.length;j++) {
          if(brandFilter[i] == this.jsonData[j]["brand"]) {
            this.firsrFilteredResult.push(this.jsonData[j]);
          }
        }
      }
    }
    if(brandFilter.length) {
      for(let i = 0; i < brandFilter.length; i++) {
        for(let j = 0; j < this.firsrFilteredResult.length; j++) {
          if(this.firsrFilteredResult[j]["brand"] == brandFilter[i]) {
            this.filteredProduct.push(this.firsrFilteredResult[j]);
          }
        }
      }
    }
    if(!this.filteredProduct.length && colorFilter.length) {
      this.filteredProduct = this.firsrFilteredResult;
    }
    else if(!this.filteredProduct.length && !colorFilter.length) {
      this.filteredProduct = this.firsrFilteredResult;
    }
    if(!brandFilter.length && !colorFilter.length) {
      this.filteredProduct = this.jsonData;
    }
    this.displayProducts(this.filteredProduct, this.availableProductButtonDiv.find("[data-checkboxKind='Availability']").is(":checked"));
  }
  showAvailableProducts = (event) => {
    this.displayProducts(this.filteredProduct, $(event.target).is(":checked"));
  }
  displayProducts = (filteredProduct, availabilityCheckbox) => {
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
  var productGrid = new ProductGrid("#color", "#brand", "#products", "#toggle", "data/product.json");
  productGrid.init();
});