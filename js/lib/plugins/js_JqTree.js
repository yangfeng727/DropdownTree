/**
* 树状图插件 created by yangfeng on 20171208 
  
  使用说明：
          1.引用jquery，引用一段css样式
          2.如果对图片不满意，可以替换。但图片与js_JqTree.js的相对位置路径不建议改变，图片路径是动态获取的当前js的路径
          3，在js代码中的引用方式
              var data=[{
                        id:'00009',
                        name:'阿萨德',
                        pid:''          // 对父级别id没有要求，如果没有更上一级别的id则自动作为父节点
                      },{
                          id:'1',
                          name:'啊是的呢',
                          pid:'00009'
                      },{
                          id:'2',
                          name:'爱仕达多所',
                          pid:'00009'
                      }]

              var tree=new jqTree({
                treeBox:'#treeBox',
                data:data,
                searchBtn:{        // 不需要搜索框可以去掉这一段
                  show:true,
                  placeHolder:'输入查询'
                },
              },function(_this){
               console.log($(_this).attr("data-value"))    //  自己需要根据业务添加的事件
              });
*/

var jqTree=function(opts,callback){
  'use strict'

	  this.options=$.extend({
     	treeBox:'',              // 生成树的div
		data:[{ id:'000',        // 数据源
    			  name:'第一级',
    		   	pid:''
    	       }],
     	searchBtn:{
            	show:false,             // 是否生成搜索框 默认为false
            	placeHolder:'输入查询' //placeHolder文本
            },        
   },opts);

    this.callback=callback || function(){}; // 点击事件的回调

	  this.$Dom;

    this.value=[];// "当前"生成的用于渲染树状图的数据

    this.noChangeValue=[];// 初始生成的用于渲染树状图的数据,不是传过来的数据,存储为string类型，便于深度拷贝给其他变量

    this.jsUrl;

    this.$SearchBtn=(this.options.searchBtn.show==true?true:false);

    this.init();
}

jqTree.fn=jqTree.prototype;

/*
 JavaScript中的5种主要的数据类型的函数clone
*/
// jqTree.fn.clone=function(obj) {
//     var o;
//     switch (typeof obj) {
//         case "undefined":
//             break;
//         case "string":
//             o = obj + "";
//             break;
//         case "number":
//             o = obj - 0;
//             break;
//         case "boolean":
//             o = obj;
//             break;
//         case "object": // object 分为两种情况 对象（Object）或数组（Array）
//             if (obj === null) {
//                 o = null;
//             } else {
//                 if (Object.prototype.toString.call(obj) === "[object Array]") {
//                     o = [];
//                     for (var i = 0; i < obj.length; i++) {
//                         o.push(jqTree.fn.clone(obj[i]));
//                     }
//                 } else {
//                     o = {};
//                     for (var k in obj) {
//                         o[k] = jqTree.fn.clone(obj[k]);
//                     }
//                 }
//             }
//             break;
//         default:
//             o = obj;
//             break;
//     }
//     return o;
// }

/*
 获取当前js的路径，用于生成图片路径
*/
jqTree.fn.getJsUrl=function(){ 
      var js=document.scripts;
      var jsPath;
      for(var i=js.length;i>0;i--){
       if(js[i-1].src.indexOf("js_JqTree.js")>-1){
       jsPath=js[i-1].src.substring(0,js[i-1].src.lastIndexOf("/")+1);
       }
     }
     this.jsUrl=jsPath;
}

/*
 生成树状图的数据
*/
jqTree.fn.createTreeData=function(data){    

	var data=data,
	map={};

	// 删除 所有 children,以防止多次调用  /20171211需要改动
	data.forEach(function (item) {
		delete item.children;
	});

  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  data.forEach( function(item, index) {
  	map[item.id]=item;
  });

  var value=[];

  data.forEach( function(item, index) {

  	   // 以当前遍历项，的pid,去map对象中找到索引的id
  	   var parent= map[item.pid];

  	   if(parent){ 

  	    	 // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
  	    	 (parent.children || ( parent.children = [] )).push(item);
  	    	}
  	    else{ // 根节点

                //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
                value.push(item);
            }

        });

  this.value=value;
};

/* 
 生成树结构
*/
jqTree.fn.creatTree=function(){    

	var str='',Sf_url=this.jsUrl;
	var domTree=function(value){

		str+='<ul class="treeCode">';
		for(var i=0;i<value.length;i++){

			if(value[i]){
				var chidrenNodes=value[i].children,shrinkTag='';

				(chidrenNodes && chidrenNodes.length>0) && (shrinkTag='<strong><img src="'+Sf_url+'/images/hide.png"/></strong>');// 伸缩标志

				str+=('<li title="'+value[i].name+'" data-value="'+value[i].id+'">'+shrinkTag+value[i].name);

				if(chidrenNodes && chidrenNodes.length>0) {
					domTree(chidrenNodes);
				}

				str+='</li>';
			}


		}
		str+='</ul>';

	};

	 domTree(this.value);

	 this.$Dom.find(">.treeCodeBox .treeUlWrap").empty().append(str);
};


/*
 树状图事件集合
*/
jqTree.fn.treeNodeEvents=function(){  

    var $Sf_DOM=this.$Dom,
    Sf_url=this.jsUrl,
    callbackTree=this.callback;


    // 初始化收缩除了根节点以外的其他节点
    $(".treeCodeBox").find('ul.treeCode').hide();
    $(".treeCodeBox >.treeUlWrap>.treeCode,.treeCodeBox >.treeUlWrap>.treeCode>li>.treeCode").show();
    $(".treeCodeBox >.treeUlWrap>.treeCode>li>strong").html('<img src="'+Sf_url+'/images/show.png"/>');

    // 生成树结构外层盒子的点击事件
    $Sf_DOM.off('click').on('click',function(){
      $(this).find('.treeCodeBox').slideToggle(500);
    });

    // 树状图li点击给父级盒子赋值
  $Sf_DOM.undelegate("li","click").delegate("li","click",function(){


    $Sf_DOM.find(">span").html($(this).attr('title')).attr('data-value',$(this).attr('data-value'));

    callbackTree(this);

    return false;
  });

  // 树状图展开收缩
   $Sf_DOM.undelegate("li>strong","click").delegate("li>strong","click",function(){

    var treeCodeUl=$(this).siblings('.treeCode');

    treeCodeUl.is(":hidden") ? (treeCodeUl.slideDown(500),$(this).html('<img src="'+Sf_url+'/images/show.png"/>') ):
                               (treeCodeUl.slideUp(500),$(this).html('<img src="'+Sf_url+'/images/hide.png"/>'));
    return false;
  });

}

/* 
 树状图样式设置
*/
jqTree.fn.cssRender=function(){ 
      var width=this.$Dom.outerWidth(),
          height=this.$Dom.outerHeight();

      this.$Dom.css({"position":"relative","cursor":"pointer"});
      this.$Dom.find(">span").css({"display":"block","width":"100%",height:"100%",overflow:"hidden","white-space":"nowrap","text-overflow": "ellipsis"});
      $(".treeCodeBox").css({"width":width,"top":height});
}


/* 
 树状图搜索框及相关事件生成
*/
jqTree.fn.createSearchBoxAndEvent=function(){
   var searchLan='<div class="treeSearchBox"><div class="hideH">'+this.options.searchBtn.placeHolder+'</div><input type="text"/><i><img src="'+this.jsUrl+'/images/search_btn.png"/></i></div>';// 生成搜索框
       this.$Dom.find(">.treeCodeBox").prepend(searchLan);

        // 搜索框相关事件
        var _Treethis=this,
             $Sf_DOM=this.$Dom,
             $Sf_Input=$Sf_DOM.find('.treeSearchBox input');

        // 阻止搜索框的冒泡
        $Sf_DOM.find(".treeSearchBox").off("click").on("click",function(){
         return false;
        });

        // 节点搜索
        var searchNodesT=function(){
           var valueInput=$Sf_Input.val(),
                thisValue=JSON.parse(_Treethis.noChangeValue);
           // thisValue=_Treethis.clone(_Treethis.noChangeValue);

           var searched_TreeData=function(paramData){  // 改变this.value的值，this.value为检索后的树状图数据

            var hasSearchChildren=false;

                for(var i=0;i<paramData.length;i++){

                     var parentHasBool=paramData[i].name.indexOf(valueInput);

                         if(paramData[i].children){

                            if(!searched_TreeData(paramData[i].children) && parentHasBool == -1){// 自己和后代都没有匹配到--》删除
                                    paramData.splice(i, 1);
                                    i--;
                            }else{
                              hasSearchChildren=true;
                            }

                         }else{ // 没有后代并且本身没有匹配到--》删除
                            if(parentHasBool == -1){
                                     paramData.splice(i, 1);
                                      i--;
                           }else{
                            hasSearchChildren=true;
                           }
                         } 

                }   

              return hasSearchChildren;
          
           }

           searched_TreeData(thisValue);

          _Treethis.value=thisValue;
          _Treethis.creatTree();

          if(valueInput==''){ // 查询条件为空才只显示一二级，其他情况显示所有的查询节点

           _Treethis.$Dom.find('ul.treeCode').hide();
           _Treethis.$Dom.find(".treeUlWrap").find(">.treeCode,>.treeCode>li>.treeCode").show();
           _Treethis.$Dom.find(".treeUlWrap >.treeCode>li>strong").html('<img src="'+_Treethis.jsUrl+'/images/show.png"/>')
         
          }
 

        }
       
        // 放大镜点击
        $Sf_DOM.find(".treeSearchBox i").off("click").on("click",function(){
           searchNodesT();
           return false;
        });

        // 键盘回车
        $Sf_Input.bind('keypress', function(e) {
          var keycode;
          if(window.event){
　　　     　 keycode = e.keyCode; //IE
    　　}
    　　else if(e.which){
      　keycode = e.which;
    　　}
    　　if (keycode != 13) {
      　　　　return;
    　　}
    　　searchNodesT();// 搜索
    　　e.stopPropagation();
    　　return false;
       });

      // 兼容ie8的placeHolder
      $Sf_Input.on('input propertychange',function(){
          if($(this).val()){
             $(this).siblings('.hideH').hide();
          }else{
             $(this).siblings('.hideH').show();
          }
      });

  
}

jqTree.fn.init=function(){
	this.$Dom=$(this.options.treeBox);
  this.getJsUrl();
	this.createTreeData(this.options.data);

  // this.noChangeValue=this.clone(this.value);
  this.noChangeValue=JSON.stringify(this.value);
  this.$Dom.append('<span></span><div class="treeCodeBox"><div class="treeUlWrap"></div></div>');

	this.creatTree();
	this.treeNodeEvents.call(this);

  if(this.$SearchBtn){  // 生成搜索框
    this.createSearchBoxAndEvent.call(this)
  }

  this.cssRender();
};