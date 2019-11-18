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
  constructor(jsonfilePath, filters, pagination, sortingOptions) {
    this.jsonfilePath = jsonfilePath;
    this.filters = filters;
    this.productDiv = $("#products");
    this.paginationDiv = $("#pagination")
    this.filtersSelected = [];
    this.isPaginationReq = pagination["paginationReq"];
    this.numberOfPages = pagination["numberOfPages"];
    this.sortingOptions = sortingOptions["sortingOptions"];
  }
  init() {
    $.getJSON(this.jsonfilePath).done(this.loadJSONData).fail(this.loadingFailed);
  }
  loadJSONData = (data) => {
    this.jsonData = data;
    this.loadFilters();
    this.loadPaginationOption();
    this.loadSortingOptions();
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
  loadPaginationOption = () => {
    if(this.isPaginationReq && this.numberOfPages.length) {
      this.filterDiv.append($("<div />", {id: "paginationDiv"})).append($("<B />", {text: "Products per page  "})).append($("<select />", {"data-pagination": "required"}));
      if($("pagination")) {
        this.numberOfPages.forEach(element => {
          $("[data-pagination='required']").append($("<option />",{value: element, text: element}));
        })
      }
    }
    this.selectedPage = 1;
    $("[data-pagination='required']").change(this.showPagination);
    this.totalNoOfPages = $("[data-pagination='required'] :selected").get(0).value; 
  }
  loadSortingOptions = () => {
    this.filterDiv.append($("<div />", {id: "sortFilter"})).append($("<B />",{text: "Sorting Options"})).append($("<select />", {"data-sortOptions": "required"}));
    this.sortingOptions.forEach(element => {
      let sortFilterName = /(?:Sort by )(.*)/;
      $("[data-sortOptions='required']").append($("<option />", {value: (element.match(sortFilterName))[1].toLowerCase(), text: element}));
    });
    this.selectedSortOption = $("[data-sortOptions='required'] :selected").get(0).value;
    $("[data-sortoptions='required']").change(this.selectSortOption);
    this.sortAndDisplay(this.jsonData, false);
  }
  selectSortOption = (event) => {
    this.selectedSortOption = event.currentTarget.value;
    this.selectedPage = 1;
    if(this.selectedSortOption == "availability") {
      this.selectedSortOption = "sold_out";
    }
    this.sortAndDisplay(this.filteredProduct, this.booleanFilters.is(":checked"));
  }
  sortAndDisplay = (products, availability) => {
    if(this.selectedSortOption == "name") {
      products.sort((firstElement, secondElement) => {
        if(parseInt(firstElement[this.selectedSortOption]) == parseInt(secondElement[this.selectedSortOption])) {
          return 0;
        }
        else if(parseInt(firstElement[this.selectedSortOption]) > parseInt(secondElement[this.selectedSortOption])) {
          return 1;
        }
        else {
          return -1;
        }
      });
    }
    else {
      products.sort((firstElement, secondElement) => {
        if(firstElement[this.selectedSortOption] == secondElement[this.selectedSortOption]) {
          return 0;
        }
        else if(firstElement[this.selectedSortOption] > secondElement[this.selectedSortOption]) {
          return 1;
        }
        else {
          return -1;
        }
      });
    } 
    this.filteredProduct = products;
    this.displayProduct(this.filteredProduct, availability);
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
    this.selectedPage = 1;
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
          oneTypeOfFilters.push(filterElement.data("filtername"));
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
    this.selectedPage = 1;
    this.displayProduct(this.filteredProduct, $(event.target).is(":checked"));
  }
  showPagination = (event) => {
    this.selectedPage = 1;
    this.totalNoOfPages = event.currentTarget.value;
    this.displayProduct(this.filteredProduct, this.booleanFilters.is(":checked"));
  }
  displayProduct = (filteredProduct, availabilityCheckbox) => {
    this.products = []; 
    var productsPerPage = [];
      if(availabilityCheckbox) {
        for(let i = 0; i < filteredProduct.length; i++) {
          if(filteredProduct[i]["sold_out"] == "0") {
            this.products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
          }
        }
      }
      else {
        for(let i = 0; i < filteredProduct.length; i++) {
          this.products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
        }
      }
      this.displayPagination(this.products);
      productsPerPage = this.productsToBeDisplayedPerPage(this.totalNoOfPages, this.selectedPage, this.products);
  }
  displayPagination = (products) => {
    let listOfPageNumbers = [];
    for(let i = 1; i <= Math.ceil(products.length / this.totalNoOfPages); i++) {
      listOfPageNumbers.push(i);
    }
    this.paginationDiv.html($("<ul />", {class: "centre"}));
    let displayListOfPagination = [];
    listOfPageNumbers.forEach(element => {
      displayListOfPagination.push($("<li />",{class: "pagination", value: element, text: element}));
    });
    this.paginationDiv.find("ul").html(displayListOfPagination);
    this.paginationDiv.find("li").click(this.selectPage);
    this.pageNoToBeHighlighted = this.paginationDiv.find("li").first();
  }
  selectPage = (event) => {
    this.pageNoToBeHighlighted.removeClass("highlight");
    this.selectedPage = event.target.value;
    this.pageNoToBeHighlighted = $(event.target);
    this.productsToBeDisplayedPerPage(this.totalNoOfPages, this.selectedPage, this.products);
    
  }
  productsToBeDisplayedPerPage = (totalPages, pageNo, products) => {
    var productsPerPage = [];
    var noOfProductsPerPage = products.length/totalPages;
    for(let i = (pageNo-1) * totalPages; i < pageNo * totalPages; i++) {
      if(products[i]) {
        productsPerPage.push(products[i]);
      }
    }
    this.productDiv.html(productsPerPage);
    this.pageNoToBeHighlighted.addClass("highlight");
  }
}
$(document).ready(function() {
var productGrid = new ProductGrid("data/product.json",[{filterName: "color", filterType:"multiple"}, {filterName: "brand", filterType:"multiple"}, {filterName: "sold_out", filterType:"boolean"}], {paginationReq: true, numberOfPages: [3,6,9]}, {sortingOptions: ["Sort by Name", "Sort by Color", "Sort by Availability", "Sort by Brand"]});
productGrid.init();
});