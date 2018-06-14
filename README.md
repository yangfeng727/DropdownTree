
 ## 使用说明：
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

