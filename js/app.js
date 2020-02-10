'use strict';

var App = (function() {

  function App(config) {
    var defaults = {
      "dataFiles": [],
      "queries": [],
      "fontSizeRange": [0.75, 3] // in rems
    };
    this.opt = _.extend({}, defaults, config);
    this.init();
  }

  function lerp(low, high, amount) {
    return (high - low) * amount + low;
  }

  function normalize(value, low, high) {
    var n = 0.0
    if ((high - low) !== 0) {
      n = (value - low) / (high - low);
    }
    return n;
  }

  App.prototype.init = function(){
    this.$app = $("#app");
    this.$form = $(".form-query").first();
    this.$textContainer = $("#text-container");

    this.total = 0;
    this.data = [];
    this.dataFilename = false;
    this.loading = false;
    this.mode = false;
    this.query = false;

    this.loadUI();
    this.onSubmit();
    this.loadListeners();
  };

  App.prototype.loadData = function(filename) {
    var d = $.Deferred();
    var _this = this;

    if (filename !== this.dataFilename) {
      this.dataFilename = filename;
      this.loadingOn();
      Papa.parse(filename, {
        header: true,
        download: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          _this.loadingOff();
          console.log("Loaded "+results.data.length.toLocaleString()+" results")
          d.resolve(results.data);
        }
      });
    } else {
      d.resolve(true);
    }

    return d;
  };

  App.prototype.loadingOff = function(){
    this.loading = false;
    this.$form.removeClass("active");
    this.$form.find("button").prop("disabled", false);
  };

  App.prototype.loadingOn = function(withOverlay){
    this.loading = true;
    this.$form.addClass("active");
    this.$form.find("button").prop("disabled", true);
  };

  App.prototype.loadListeners = function(){
    var _this = this;

    this.$form.on("submit", function(e){
      e.preventDefault();
    });

    this.$form.find("input, select").on("change", function(e){
      _this.onSubmit();
    });
  };

  App.prototype.loadQuery = function(query){
    var pattern = "";
    var flags = "i";
    // exact match
    if (query.startsWith("=")) {
      pattern = "^"+query.substr(1)+"$";

    // contains pattern
    } else if (query.startsWith("~")) {
      pattern = query.substr(1);
      flags = "gi";

    // text search
    } else {
      query = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); // escape special regex chars
      pattern = "^.*("+query+").*$";
    }
    var re = new RegExp(pattern, flags);
    var $items = $("#text-container > span");

    _.each(this.data, function(item, i){
      if (query.length < 1) {
        $items.eq(i).addClass("active");
        return;
      }
      var matches = item.text.toString().match(re);
      if (matches && matches.length > 0) {
        $items.eq(i).addClass("active");
      } else {
        $items.eq(i).removeClass("active");
      }
    })
  };

  App.prototype.loadText = function(data){
    this.$textContainer.empty();
    if (data.length < 1) return;
    var _this = this;
    // assumes data is sorted
    var maxCount = data[0].count;
    var minCount = data[data.length-1].count;
    var html = "";
    _.each(data, function(item, i){
      // determine font size via count
      var amount = normalize(item.count, minCount, maxCount);
      var fontSize = lerp(_this.opt.fontSizeRange[0], _this.opt.fontSizeRange[1], amount);
      fontSize = +fontSize.toFixed(2)
      html += "<span style=\"font-size: "+fontSize+"rem\"><strong>"+item.text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;")+"</strong> <em>("+item.count.toLocaleString()+")</em></span>";
    });
    this.$textContainer.html(html);
  };

  App.prototype.loadUI = function(){
    var html = "";
    _.each(this.opt.dataFiles, function(item, i){
      html += "<option value=\""+item.filename+"\"";
      if (i===0) html += " selected";
      html += ">"+item.name+"</option>";
    });
    $("#select-data").html(html);

    html = "";
    _.each(this.opt.queries, function(item, i){
      html += "<option value=\""+item.query+"\"";
      if (i===0) html += " selected";
      html += ">"+item.name+"</option>";
    });
    $("#select-query").html(html);
  };

  App.prototype.onDataLoaded = function(result){
    this.loadingOff();
  };

  App.prototype.onSubmit = function(){
    var _this = this;

    if (this.loading) return false;

    var dataFilename = $("#select-data").val();
    var query = $("#input-query").val();
    var mode = $("input[name=\"mode\"]:checked").val();

    // update mode
    if (mode !== this.mode) {
      console.log("Change mode:", mode);
      this.mode = mode;
      this.$app.attr("data-mode", mode);
    }

    // check for query
    var queryChanged = false;
    if (query !== this.query) {
      console.log("Change query:", query);
      this.query = query;
      queryChanged = true;
    }

    // load data
    var dataPromise = this.loadData(dataFilename);
    $.when(dataPromise).done(function(result) {
      var dataChanged = (result !== true);
      if (dataChanged) {
        console.log("Changing data");
        _this.total = _.reduce(result, function(memo, item){ return memo + item.count; }, 0);
        result = _.filter(result, function(item){ return item.text !== "<empty>"; })
        _this.data = result;
        _this.loadText(result);
      }
      if (dataChanged || queryChanged) {
        _this.loadQuery(_this.query);
      }
    });

  };

  return App;

})();

$(function() {
  var app = new App(CONFIG);
});
