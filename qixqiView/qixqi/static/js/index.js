// alert('hello');
$(function(){

    // 利用jquery中sort()的自定义方法
    jQuery.extend({
        'sortRule': function(){
            return function(book1, book2){
                if(book1.rating > book2.rating){        // 因为靠前的在下面，所以rank小
                    return 1;       // 交换位置
                }else if(book1.rating < book2.rating){
                    return -1;      // 不要交换位置
                }else{
                    return 0;       // 不要交换位置
                }
            };
        }
    });


    
    // 更新表
    jQuery.extend({
        'flushView': function(names, ranks){
            console.log(names);
            console.log(ranks);
            /* 柱状图 */
            echarts.init(document.getElementById('rank')).setOption({
                title:{
                    text: '风云榜'
                },
                tooltip: {},
                legend: {
                    data: ['rank']
                },
                xAxis:{},
                yAxis: {
                    data: names
                },
                series: [{
                    name: 'rank',
                    type: 'bar',
                    data: ranks
                }]
            });

        }
    });



    $.ajax({        // 跨域访问
        type: 'get',    // 不支持post跨域访问
        async: false,
        url: 'http://localhost:5000/getBook',
        dataType: 'json',
        success: function(data){
            // alert(data[0].name);
            // alert(data.length);
            // $.each(data, function(index, value){
                // alert(value.name + ' ' + value.rating);
            // });
            // console.log(data);
            // console.log(data.sort($.sortRule()));
            // console.log(data);

            data.sort($.sortRule());    // 排序
            console.log(data);
            // console.log(data.map(item => item.name));   // 获取属性数组
            $.flushView(data.map(item => item.name), data.map(item => item.rating));
        },
        error: function(err){
            window.location.href = '/error';
            console.error(err.responseText);
        }
        
    });



    $.rank = function(rating, user_count, week_recommend){
        
    };




});