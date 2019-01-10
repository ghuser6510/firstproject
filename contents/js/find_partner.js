$(document).ready(function(){
	
	//custom drop down for countries
	$(".niceCountryInputSelector").each(function(i,e){
		new NiceCountryInput(e).init();
	});
	
	//json query
	function getObjects(obj, key, val) {
		var objects = [];
		for (var i in obj) {
			if (!obj.hasOwnProperty(i)) continue;
			if (typeof obj[i] == 'object') {
				objects = objects.concat(getObjects(obj[i], key, val));
			} else if (i == key && obj[key] == val) {
				objects.push(obj);
			}
		}
		return objects;
	}//getObjects
	
	
	var my_city_options = [];
	ResetCitiesDroplist = function(country){
		my_city_options = [];
		var my_cities_list_array = getObjects(my_cities, 'country', country);
		for(var i = 0; i< my_cities_list_array.length ; i++)
		{
			var myObject = new Object();
			myObject.id = i;
			myObject.name = my_cities_list_array[i].name;;
			my_city_options.push( myObject);
		}
		//console.log(my_city_options);
		
		$('#input-city-tags').selectize({
			plugins: ['remove_button'],
			maxItems: null,
			valueField: 'name',
			labelField: 'name',
			searchField: 'name',
			options: my_city_options,
			create: false,
		});
		
	}//ResetCitiesDroplist
	
	
	SetLanguagesSelect = function(){
		$('.input-language-tags').selectize({
			plugins: ['remove_button'],
			maxItems: null,
			valueField: 'language',
			labelField: 'language',
			searchField: 'language',
			options: my_languages,
			create: false,
		});
	}
	
	
	
	SetInterestsSelect = function(){
		$('.input-interests-tags').selectize({
			plugins: ['remove_button'],
			maxItems: null,
			valueField: 'name',
			labelField: 'name',
			searchField: 'name',
			options: my_interests,
			create: true,
		});
	}
	
	var my_cities;
	function GetCities(){
		$.ajax({
		  type: "GET",
		  url: "/cities_list",
		  success: function(msg){
				my_cities = msg;
				ResetCitiesDroplist($(".niceCountryInputMenuCountryFlag").attr('data-flagiso'));
				//console.log(msg);
		  }// end post success
		});
	}// end function LoginUser
	GetCities();
	
	
	var my_languages;
	function GetLanguages(){
		$.ajax({
		  type: "GET",
		  url: "/languages_list",
		  success: function(msg){
				my_languages = msg;
				SetLanguagesSelect();
				//console.log(msg);
		  }// end post success
		});
	}// end function LoginUser
	GetLanguages();
	
	var my_interests;
	function GetInterests(){
		$.ajax({
		  type: "GET",
		  url: "/interests_list",
		  success: function(msg){
				my_interests = msg;
				SetInterestsSelect();
				//console.log(msg);
		  }// end post success
		});
	}// end function LoginUser
	GetInterests();

	
	
	$(".submit_filter").bind('touchstart click', function(){
		UpdateFilterResults();
	});
	
	UpdateFilterResults = function(){
		var country = $(".niceCountryInputMenuCountryFlag").attr('data-flagiso');
		
		var submittedCities = "";
		$('.input-city-tags').find('.item').each(function(index, element) {
			submittedCities += $(this).attr('data-value');
			submittedCities += ","
		});
		//if(submittedCities.length>0)
		submittedCities = submittedCities.substring(0, submittedCities.length-1);
		
		var submittedSoughtLanguages = "";
		$('.input-sought-languages').find('.item').each(function(index, element) {
			submittedSoughtLanguages += $(this).attr('data-value');
			submittedSoughtLanguages += ","
		});
		//if(submittedSoughtLanguages.length>0)
		submittedSoughtLanguages = submittedSoughtLanguages.substring(0, submittedSoughtLanguages.length-1);
		
		var submittedInterests = "";
		$('.input-interests-tags').find('.item').each(function(index, element) {
			submittedInterests += $(this).attr('data-value');
			submittedInterests += ","
		});
		//if(submittedInterests.length>0)
		submittedInterests = submittedInterests.substring(0, submittedInterests.length-1);
		
		var current_location = $(location).attr('href');
		current_location = current_location.substring(0, current_location.indexOf('find_partner/'));
		
		var destination = current_location + "find_partner/0";
		var count_queries = 0;
		if(country.length != 0)
		{
			if(count_queries == 0)
				destination +="?";
			else
				destination +="&";
				
			destination += "country=";
			destination += country;
			count_queries++;
		}
		
		if(submittedCities.length != 0)
		{
			if(count_queries == 0)
				destination +="?";
			else
				destination +="&";
				
			destination += "cities=";
			destination += submittedCities;
			count_queries++;
		}
		
		if(submittedSoughtLanguages.length != 0)
		{
			if(count_queries == 0)
				destination +="?";
			else
				destination +="&";
				
			destination += "sought_languages=";
			destination += submittedSoughtLanguages;
			count_queries++;
		}
		
		if(submittedInterests.length != 0)
		{
			if(count_queries == 0)
				destination +="?";
			else
				destination +="&";
				
			destination += "interests=";
			destination += submittedInterests;
			count_queries++;
		}
		
		window.location.href = destination; 
		
	}//UpdateFilterResults
	
	
		
});//$(document).ready(function()

