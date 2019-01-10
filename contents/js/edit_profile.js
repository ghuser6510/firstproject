$(document).ready(function(){
	
	
	
	//custom drop down for countries
	$(".niceCountryInputSelector").each(function(i,e){
		new NiceCountryInput(e).init();
	});
	
	//custom multiple select for languages
	 
	/* dummy exampe with delete confirmation
	$('.input-language-tags').selectize({
		plugins: ['remove_button'],
		maxItems: null,
		valueField: 'id',
		labelField: 'title',
		searchField: 'title',
		options: [
			{id: 1, title: 'Spectrometer', url: 'http://en.wikipedia.org/wiki/Spectrometers'},
			{id: 2, title: 'Star Chart', url: 'http://en.wikipedia.org/wiki/Star_chart'},
			{id: 3, title: 'Electrical Tape', url: 'http://en.wikipedia.org/wiki/Electrical_tape'}
		],
		create: false,

		onDelete: function(values) {
			return confirm(values.length > 1 ? 'Are you sure you want to remove these ' + values.length + ' items?' : 'Are you sure you want to remove "' + values[0] + '"?');
		}
	});
	*/
	
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
			myObject.name = my_cities_list_array[i].name;
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
	
	
	
	
	$(".edit_profile_submit").bind('touchstart click', function(){
		SubmitEditProfileForm();
	});
	
	$(".delete_image").bind('touchstart click', function(){
		$(".profile_pic").attr('src','');
		$(".profile_pic").attr('alt','');	
	});
	
	SubmitEditProfileForm = function()
	{
		
		//adding the new interests if any.
		$('.input-interests-tags').find('.item').each(function(index, element) {
			var item_found = false;
			for(var i =0; i<my_interests.length;i++)
			{
				if(my_interests[i].name == $(this).attr('data-value'))
				{
					item_found = true;
					break;
				}
				else{
					//console.log('must add: ' + $(this).attr('data-value'));
				}
			}//end for
			
			if(!item_found){
				var TestInterest = {
					name: $(this).attr('data-value')
				};
				RegisterNewInterest(TestInterest);
			}// if not found
        });//each
		
		//resetting
		$(".edit_profile_confirmpassword_span").text("");
		$(".edit_profile_password").removeClass('FormInputError');
		$(".edit_profile_confirm_password").removeClass('FormInputError');
		
		
		var form_validated = true;
		//front-end confrimpassword validation
		if( $(".edit_profile_password").val() != ""){
			if(  $(".edit_profile_password").val() != $(".edit_profile_confirm_password").val() ) { 
				$(".edit_profile_password").addClass('FormInputError');
				$(".edit_profile_confirm_password").addClass('FormInputError');
				$(".edit_profile_confirmpassword_span").text("Password - Confirm pass missmatch");
				form_validated = false;
			}
		}
		
		
		
		if(form_validated)
		{
			var TestUser = new Object();
			
			
			TestUser.country = $(".niceCountryInputMenuCountryFlag").attr('data-flagiso');
			TestUser.country_name = $(".niceCountryInputMenuDefaultText span").text();
			
			var submittedCities = "";
			$('.input-city-tags').find('.item').each(function(index, element) {
				submittedCities += $(this).attr('data-value');
				submittedCities += ","
			});
			//if(submittedCities.length>0)
			submittedCities = submittedCities.substring(0, submittedCities.length-1);
			TestUser.cities = submittedCities;
				
			
			var submittedNativeLanguages = "";
			$('.input-native-languages').find('.item').each(function(index, element) {
				submittedNativeLanguages += $(this).attr('data-value');
				submittedNativeLanguages += ","
			});
			//if(submittedNativeLanguages.length>0)
			submittedNativeLanguages = submittedNativeLanguages.substring(0, submittedNativeLanguages.length-1);
			TestUser.native_languages = submittedNativeLanguages;
				
			var submittedSoughtLanguages = "";
			$('.input-sought-languages').find('.item').each(function(index, element) {
				submittedSoughtLanguages += $(this).attr('data-value');
				submittedSoughtLanguages += ","
			});
			//if(submittedSoughtLanguages.length>0)
			submittedSoughtLanguages = submittedSoughtLanguages.substring(0, submittedSoughtLanguages.length-1);
			TestUser.sought_languages = submittedSoughtLanguages;
				
			var submittedInterests = "";
			$('.input-interests-tags').find('.item').each(function(index, element) {
				submittedInterests += $(this).attr('data-value');
				submittedInterests += ","
			});
			//if(submittedInterests.length>0)
			submittedInterests = submittedInterests.substring(0, submittedInterests.length-1);
			TestUser.interests = submittedInterests;
			
			//if($(".about_text_area").val() != "")	
			TestUser.about_me = $(".about_text_area").val();
			
			//if($(".profile_pic").attr('alt') != "")
			TestUser.profile_pic = $(".profile_pic").attr('alt');
			
			if( $(".edit_profile_password").val() != "")
				TestUser.password = $(".edit_profile_password").val();
			
			//var temp_values = Object.values(TestUser);
			
			//var temp_values = JSON.stringify(TestUser);
			//alert(newvalues);
			//var newvalues = {
				//cities : temp_values[1]
			//}
			//alert(newvalues);
			//var logged_user = $(".logged_user").text();
			
			$.ajax({
			  type: "POST",
			  url: "/updateuser",
			  data: TestUser,
			  success: function(msg){
				if( msg == "user updated")
				{
					alert( msg );
				}
				else
				{
					alert( 'error:' + msg );
				}
			  }// end post success
			});
			
		}
		else
		{
			alert("form not validated");	
		}
		
	}// end Submit function
	
	
	function RegisterNewInterest(InterestInfo){
		$.ajax({
		  type: "POST",
		  url: "/add_new_interest",
		  data: InterestInfo,
		  success: function(msg){
			if( msg == "OK")
			{
				alert( msg );
			}
			else
			{
				alert( 'error:' + msg );
			}
		  }// end post success
		});
	}// RegisterNewInterest
	
	
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
	

	
	$("form#data").submit(function(e) {
		e.preventDefault();    
		var formData = new FormData(this);
	
		$.ajax({
			url: "/upload_single_image",
			type: 'POST',
			data: formData,
			success: function (data) {
				alert(data);
				var str = data;
				var patt = new RegExp("Success:");
				var res = patt.test(str);
				if(res)
				{
					$(".profile_pic").attr('src',data.substring(8, data.length));
					$(".profile_pic").attr('alt',data.substring(8, data.length));	
				}
			},
			cache: false,
			contentType: false,
			processData: false
		});
	});
	
	
	///////populate first load from database
	
	PopulateFirstCities = function(){
		var user_cities_str="";
		for(var i = 0; i<$(".hidden_saved_cities").children().length;i++)
		{
			user_cities_str += unescape($(".hidden_saved_cities span").eq(i).text());
			user_cities_str +=",";	
		}
		user_cities_str = user_cities_str.substring(0, user_cities_str.length-1);
		$(".input-city-tags").attr('value', user_cities_str);
	}
	PopulateFirstCities();
	
	
	
	PopulateFirstNativeLanguages = function(){
		var user_native_languages_str="";
		for(var i = 0; i<$(".hidden_saved_native_languages").children().length;i++)
		{
			user_native_languages_str += unescape($(".hidden_saved_native_languages span").eq(i).text());
			user_native_languages_str +=",";	
		}
		user_native_languages_str = user_native_languages_str.substring(0, user_native_languages_str.length-1);
		$(".input-native-languages").attr('value', user_native_languages_str);
	}
	PopulateFirstNativeLanguages();
	
	
	PopulateFirstSoughtLanguages = function(){
		var user_sought_languages_str="";
		for(var i = 0; i<$(".hidden_saved_sought_languages").children().length;i++)
		{
			user_sought_languages_str += unescape($(".hidden_saved_sought_languages span").eq(i).text());
			user_sought_languages_str +=",";	
		}
		user_sought_languages_str = user_sought_languages_str.substring(0, user_sought_languages_str.length-1);
		$(".input-sought-languages").attr('value', user_sought_languages_str);
	}
	PopulateFirstSoughtLanguages();
	
	
	PopulateFirstInterests = function(){
		var user_interests_str="";
		for(var i = 0; i<$(".hidden_saved_interests").children().length;i++)
		{
			user_interests_str += unescape($(".hidden_saved_interests span").eq(i).text());
			user_interests_str +=",";	
		}
		user_interests_str = user_interests_str.substring(0, user_interests_str.length-1);
		$(".input-interests-tags").attr('value', user_interests_str);
	}
	PopulateFirstInterests();
	
	
	
});//$(document).ready(function()

