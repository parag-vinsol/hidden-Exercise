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
  constructor(jsonfilePath, filters, pagination, sortingOptions, containerObj) {
    this.jsonfilePath = jsonfilePath;
    this.filters = filters;
    this.containerObj = containerObj;
    this.filtersSelected = [];
    this.isPaginationReq = pagination["paginationReq"];
    this.numberOfPages = pagination["numberOfPages"];
    this.sortingOptions = sortingOptions;
  }
  init() {
    this.containerObj.forEach(element => {
      if(element.containerName == "FilterDiv") {
        this.filterDiv = $(element.containerId);
      }
      else if(element.containerName == "ProductDiv") {
        this.productDiv = $(element.containerId);
      }
      else if(element.containerName == "PaginationDiv") {
        this.paginationDiv = $(element.containerId);
      }
    })
    $.getJSON(this.jsonfilePath).done(this.loadJSONData).fail(this.loadingFailed);
  }
  loadJSONData = (data) => {
    this.jsonData = data;
    this.filteredProduct = [];
    this.jsonData.forEach(element => {
      let product = new Product(element);
      this.filteredProduct.push(product);
    });
    this.filteredData = this.filteredProduct;
    this.loadFilters();
    this.loadPaginationOption();
    this.loadSortingOptions();
    this.loadPage();
  }
  loadingFailed = () => {
    console.log("failed");
  }
  loadFilters = () => {
    this.filterProvided = new Set();
    this.filters.forEach(filterElement => {
      let uniqueFilter = new Set();
      let uniqueFilterForBoolean = new Set();
      this.jsonData.forEach(dataElement => {
        if(filterElement["filterType"] == "multiple") {
          uniqueFilter.add(dataElement[filterElement["filterName"]]);
          this.filterProvided.add(filterElement["filterName"]);
        }
        else if(filterElement["filterType"] == "boolean") {
          uniqueFilterForBoolean.add(filterElement["filterName"]);
        }
      });
      this.displayMultipleFilters(filterElement, uniqueFilter);
      if(uniqueFilterForBoolean.size) {
        this.displayBooleanFilter(filterElement);
      }
    });
  }
  displayMultipleFilters = (filterElement, uniqueFilter) => {
    this.filterDiv.append($("<B />", {text: `${filterElement["filterName"]} Filters`}));
      uniqueFilter.forEach(element => {
        this.filterDiv.append($("<li />", {value: element, text: element}).append($("<input />",{type: "checkbox", "data-filterKind": filterElement["filterName"], "data-filterName": element, "data-filterType": filterElement["filterType"]})));
      });
  }
  displayBooleanFilter = (filterElement) => {
    this.filterDiv.append($("<br>")).append($("<input />", {type: "checkbox", "data-filterType": filterElement["filterType"]})).append("Available Products");
  }
  loadPaginationOption = () => {
    this.displayPageNumber();
    this.selectedPage = 1;
    $("[data-pagination='required']").change(this.showPagination);
    this.totalNoOfPages = $("[data-pagination='required'] :selected").get(0).value; 
  }
  displayPageNumber = () => {
    if(this.isPaginationReq && this.numberOfPages.length) {
      this.filterDiv.append($("<div />", {id: "paginationDiv"})).append($("<B />", {text: "Products per page  "})).append($("<select />", {"data-pagination": "required"}));
      if($("pagination")) {
        let options = [];
        this.numberOfPages.forEach(element => {
          options.push($("<option />",{value: element, text: element}));
        });
        $("[data-pagination='required']").append(options);
      }
    }
  }
  loadSortingOptions = () => {
    this.displaySortOptions();
    this.selectedSortOption = $("[data-sortOptions='required'] :selected").get(0).value;
    $("[data-sortoptions='required']").change(this.selectSortOption);
    this.sortAndDisplay(this.filteredData, false);
  }
  displaySortOptions = () => {
    let textForSelect = $("<B />",{text: "Sorting Options"}).append($("<select />", {"data-sortOptions": "required"}));
    let divForSelectOptions = $("<div />", {id: "sortFilter"}).append(textForSelect);
    this.filterDiv.append(divForSelectOptions);
    let options = [];
    this.sortingOptions.forEach(element => {
      options.push($("<option />", {value: element.sortBy, text: element.displayName}));
    });
    $("[data-sortOptions='required']").append(options);
  }
  selectSortOption = (event) => {
    this.selectedSortOption = event.currentTarget.value;
    this.selectedPage = 1;
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
    this.displayProduct(this.filteredProduct, availability)
  }
  loadPage = () => {
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
    this.filteredProduct = this.filteredData;
    let filterKind = [];
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
      if(element.length){
        this.ProductsBasedOnFilters(element, this.filteredProduct);
      }
    });
    this.sortAndDisplay(this.filteredProduct,this.booleanFilters.is(":checked"));
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
    if(tempProducts.length) {
      this.filteredProduct = tempProducts;
    }
    else {
      this.filteredProduct = products;
    }
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
    this.filteredProduct = []; 
    var productsPerPage = [];
      if(availabilityCheckbox) {
        for(let i = 0; i < filteredProduct.length; i++) {
          if(filteredProduct[i]["sold_out"] == "0") {
            this.products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
            this.filteredProduct.push(filteredProduct[i]);
          }
        }
      }
      else {
        for(let i = 0; i < filteredProduct.length; i++) {
          this.products.push($("<li />", {name: filteredProduct[i]["name"]}).append($("<img />", {src:"images/" + filteredProduct[i]["url"]})));
          this.filteredProduct.push(filteredProduct[i]);
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
  var containerObj = [{containerName: "FilterDiv", containerId: "#filters"}, 
                      {containerName: "ProductDiv", containerId: "#products"}, 
                      {containerName: "PaginationDiv", containerId: "#pagination"}];
  var sortingOptions = [{displayName: "Sort By Name", sortBy: "name"}, 
                        {displayName: "Sort By Color", sortBy: "color"}, 
                        {displayName: "Sort By Availabilty", sortBy: "sold_out"}, 
                        {displayName: "Sort By Brand", sortBy: "brand"}];
  var filters = [{filterName: "color", filterType:"multiple"}, 
                 {filterName: "brand", filterType:"multiple"}, 
                 {filterName: "sold_out", filterType:"boolean"}];
  var paginationObj = {paginationReq: true, numberOfPages: [3,6,9]};
  var jsonFilePath = "data/product.json";
  var productGrid = new ProductGrid(jsonFilePath, filters, paginationObj, sortingOptions, containerObj);
  productGrid.init();
});