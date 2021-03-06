//<-----------------------------------Choose Quote method--------------------------------------------->
var multipost_ids = new Array();

function toggle_user_select_display(contractOrExpand) {
	var userSelectElement2 = document.getElementById('user_select2');
	var userSelectElement3 = document.getElementById('user_select3');
	var toggleLinkElementContract = document.getElementById('user_select_toggle_link_contract');
	var toggleLinkElementExpand = document.getElementById('user_select_toggle_link_expand');
	
	var upperLimit = 3;
	var totalVisibleIsolationSelectionElements = $(".iso_select:visible").size();
	
	if(contractOrExpand == "contract")
	{//We are removing one of the select elements.
	
	    if(totalVisibleIsolationSelectionElements - 1 >= 1)
	    {
	        if($(userSelectElement3).is(":visible"))
	        {
	            $(userSelectElement3).hide();
	            $(userSelectElement3).val(0);
	        }
	        else if($(userSelectElement2).is(":visible"))
	        {
	            $(userSelectElement2).hide();
	            $(userSelectElement2).val(0);
	        }
	            
	        --totalVisibleIsolationSelectionElements;
	    }
	}
	else if(contractOrExpand == "expand")
	{//We are adding a select element.
	
	    if(totalVisibleIsolationSelectionElements + 1 <= upperLimit)
	    {
	        if(!$(userSelectElement2).is(":visible"))
	            $(userSelectElement2).show();
	        else if(!$(userSelectElement3).is(":visible"))
	            $(userSelectElement3).show();
	            
	        ++totalVisibleIsolationSelectionElements;
	    }
	}
	
	//Update the contract button, if necessary.
	if(totalVisibleIsolationSelectionElements > 1)
	{//Make sure the contract button is visible.
	    $(toggleLinkElementContract).show();
	}
	else if(totalVisibleIsolationSelectionElements <= 1)
	{//Hide the contract button.
	    $(toggleLinkElementContract).hide();
	}
	
	//Update the expand button, if necessary.
	if(totalVisibleIsolationSelectionElements >= upperLimit)
	{
	    $(toggleLinkElementExpand).hide();
	}
	else if(totalVisibleIsolationSelectionElements < upperLimit)
	{
	    $(toggleLinkElementExpand).show();
	}
}

function quote (post_id, username, forum, topic, event){
	var append= "./posting.php?mode=";
	if (!addRemovePost(post_id))
	{
		addRemovePost(post_id);
	}
	if (multipost_ids.length > 1){
		append += "multi&f=" + forum + getPHPArrayMultiPostIds();
		eraseMultiCookie(topic);
	} 
	else if (storeQuote (post_id, username, "")){
		addRemovePost(post_id);
		append += "select&f=" + forum + "&p=" + post_id;
	}
	else{
		append += "multi&f=" + forum + getPHPArrayMultiPostIds();
		eraseMultiCookie(topic);
	}
	if ('which' in event){
		if (event.which=='2')
		{
			window.open(append,'');
		}
		else{
			window.open(append,'_self');
		}
	}
	else if('button' in event){
		if (event.button=='4')
		{
			window.open(append,'');
		}
		else{
			window.open(append,'_self');
		}
	}

	return false;
}
function replyquote (topic_id, forum){
	var append= "./posting.php?mode=";
	if (multipost_ids.length > 0){
		append += "multi&f=" + forum + getPHPArrayMultiPostIds();
		eraseMultiCookie(topic_id);
	} else{
		return true;
	}

	window.location = append;
	return false;
}
function formquote (topic_id, forum, mode){
	var append= "./posting.php?mode=";
	if (multipost_ids.length > 0)
	{
		append += "multi&f=" + forum + getPHPArrayMultiPostIds();
		if (mode == 'p'){
			append += '#preview'
		}
		document.getElementById('editor').action=(append);
		eraseMultiCookie(topic_id);
	}
	return true;

}
//<---------------------------------SELECT QUOTE---------------------------------------------------->

//checks for quote by selection, if used saves the selected text to a cookie and returns true, if not used or used incorrectly returns false.
function storeQuote (post_id, username, l_wrote){
	var message_name = 'p' + post_id;
	var theSelections = new Array();
	var divarea = false;
	var trueSelections='';
	var selectionError = false; // set to true if the selected segment(s) are from a post other than post_id.
	var selections; //used to hold the various continguous selections.
	if (l_wrote === undefined)
	{
		// Backwards compatibility
		l_wrote = 'wrote';
	}
	if (document.all)
	{
		divarea = document.all[message_name];
	}
	else
	{
		divarea = document.getElementById(message_name);
	}

	if (window.getSelection)
	{
		selections = window.getSelection();
		//for performance issues.
		if(selections.rangeCount==0){
			return false;
		}

		if (document.selection)
		{
			trueSelections = document.selection.createRange().text;
		}
		else{
			trueSelections= window.getSelection().toString(); // used for reformating individual lines.
		}
		//get all the non-contiguouse selections and save each to a spot in the array
		for (var count=0; count<selections.rangeCount; count++)
		{
			theSelections[count] = selections.getRangeAt(count).toString();
		}
		//check to make sure all the selections are from the post associated with this quote button
		for (var count=0; count<selections.rangeCount; count++)
		{
			if (postNotContains(post_id, theSelections[count])){
				selectionError = true; 
			}
		}
		//reformat that selections
		var i = 0;
		var char1;
		var char2;
		for (var j=0; j<theSelections.length; j++)
		{
			for (var k=0; k<theSelections[j].length; k++)
			{
				char1 = trueSelections.charAt(i);
				char2 = theSelections[j].charAt(k);
				if (char1 != char2)
				{
					if (char2.charCodeAt(0) == 32){
						i--;
					}
					else {
					theSelections[j]= theSelections[j].substring(0,k) + char1 + theSelections[j].substring(k,theSelections[j].length);
					}	
				}
				i++;
			}
		}
	}
	else if (document.getSelection)
	{
		theSelections[0] = document.getSelection();
	}
	else if (document.selection)
	{		
		theSelections[0] = document.selection.createRange().text;
	}
	//if nothing from this post was selected, or they selected things from multiple posts, give them this full post instead.
	if (selectionError || theSelections[0] == '' || typeof theSelections[0] == 'undefined' || theSelections[0] == null)
	{
		return false;
	}
	var cookiecontent = '';
	//output
	for (var count=0;count<theSelections.length ;count++)
	{
		cookiecontent += theSelections[count] + "NqLN5jsRe24krOHFSruT";
	}
	cookiecontent = encodeURIComponent(cookiecontent);
	setCookie("ugEvYSDJEOAz2bHadHvOPOST_"+post_id,cookiecontent, 1);
	return true;
}

function postNotContains(post_id, text){
	var message_name = 'p' + post_id;
	var divarea = false;
	var content = '';
	if (document.all)
	{
		divarea = document.all[message_name];
	}
	else
	{
		divarea = document.getElementById(message_name);
	}
	var array = divarea.getElementsByTagName("div");
	content = $(array[5]).text();
	return (stripWhiteSpace(content).indexOf(stripWhiteSpace(text), 0)==-1);
}

//Strips HTML from a string
function stripHTML(text){
	var strippedText = text.replace(/<\/?[^>]+(>|$)/ig, "")
	strippedText = strippedText.replace(/<br>/ig, '\n');
	strippedText = strippedText.replace(/<br\/>/ig, '\n');
	strippedText = strippedText.replace(/&lt\;/ig, '<');
	strippedText = strippedText.replace(/&gt\;/ig, '>');
	strippedText = strippedText.replace(/&amp\;/ig, '&');
	strippedText = strippedText.replace(/&nbsp\;/ig, ' ');
	return ;	
}
//Strips whitespace from a string
function stripWhiteSpace(text){
  var blackText = text;
  blackText = blackText.replace(/\n/g, '');
  blackText = blackText.replace(/(\s)/ig, '');
  return blackText; 
}



//<-----------------------------------------MULTI QUOTE---------------------------------------------------------->

function initializeMultiposts(topic_id){
	var tempPosts = getCookie("ugEvYSDJEOAz2bHadHvOMULTITOPIC_" + topic_id);
	count = 0;
	while(tempPosts != "" && tempPosts != undefined){
		multipost_ids[count] = tempPosts.substr(0,tempPosts.indexOf(" "));
		count++;
		tempPosts = tempPosts.substr(tempPosts.indexOf(" ")+1);
	}
}
function multiquote(post_id){
	var message_name = 'p' + post_id;
	var divarea = false;
	if (document.all)
	{
		li = document.all[message_name].getElementsByTagName('li');
	}
	else
	{
		li = document.getElementById(message_name).getElementsByTagName('li');
	}
	
	if(addRemovePost(post_id)){
		for(var i = 0; i <li.length;i++){
			if (li[i].className == 'multiquoteplus-icon')
			{
				li[i].className = 'multiquoteminus-icon';
				li[i].firstChild.title = 'Remove from multiquote list';
				return false;
			}
		}
	}else{
		for(var i = 0; i <li.length;i++){
			if (li[i].className == 'multiquoteminus-icon')
			{
				li[i].className = 'multiquoteplus-icon';
				li[i].firstChild.title = 'Add to multiquote list';
				return false;
			}
		}
	}
	return false;
}

function addRemovePost(post_id){
	for (var i =0;i<multipost_ids.length ;i++ )
	{
		if (multipost_ids[i] == post_id)
		{
			multipost_ids.splice(i,1);
			return false;
		}
	}
	multipost_ids.push(post_id);
	return true;
}



function saveMutiquote(topic_id){
	setCookie("ugEvYSDJEOAz2bHadHvOMULTITOPIC_" + topic_id, getCookieMultiPostIds(), 1);
}


//returns the multipost_ids array in get php array format.
function getPHPArrayMultiPostIds(){
		var posts = "";
		for (var i =0;i<multipost_ids.length ;i++ )
		{	
		//	if(multipost_ids[i] != post_id){
				posts+="&m[]="+ multipost_ids[i];
		//	}
		}
		return posts;

}

function getCookieMultiPostIds(){
		var posts = "";
		for (var i =0;i<multipost_ids.length ;i++ )
		{	
			posts+= multipost_ids[i] + " ";
		}
		return posts;
}


function eraseMultiCookie(topic_id){
	setCookie("ugEvYSDJEOAz2bHadHvOMULTITOPIC_" + topic_id, '', -24);
}


//sets the cookie 'c_name' to 'value'
function setCookie(c_name,value,exhr)
{
	var exdate=new Date();
	exdate.setHours(exdate.getHours() + exhr);
	var c_value=escape(value) + ((exhr==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
  {
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

