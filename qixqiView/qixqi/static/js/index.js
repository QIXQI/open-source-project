// alert('hello');
/**
 * 1. splice 与 slice 区别：前者修改原数组，后者查询原数组
 */

$(function(){
    // 配置信息
    var period = 1;     // 每隔1s刷新
    var maxItemNum = 10;     // 页面中最多展示10条结果

    var rankBar = echarts.init(document.getElementById('rank'));
    rankBar.showLoading();      // 打开loading动画

    var flushTimeout;    


    // 排名策略
    jQuery.extend({
        'rank': function(rating, user_count, week_recommend){

        }
    });


    // 利用jquery中sort()的自定义方法
    jQuery.extend({
        'sortRule': function(){
            return function(book1, book2){
                if(book1.rating < book2.rating){        // 因为靠前的在下面，所以rank小
                    return 1;       // 交换位置
                }else if(book1.rating > book2.rating){
                    return -1;      // 不要交换位置
                }else{
                    return 0;       // 不要交换位置
                }
            };
        }
    });


    
    // 初始化表
    jQuery.extend({
        'initView': function(names, ranks){
            console.log(names);
            console.log(ranks);
            /* 柱状图 */
            // var rankBar = echarts.init(document.getElementById('rank'));
            // rankBar.showLoading();      // 打开loading动画
            rankBar.hideLoading();      // 隐藏loading动画
            rankBar.setOption({
                title:{
                    text: '风云榜'
                },
                tooltip: {},
                legend: {
                    data: ['rank']
                },
                xAxis:{},
                yAxis: {
                    data: names.reverse()       // 数组倒置
                },
                series: [{
                    name: 'rank',
                    type: 'bar',
                    smooth: true,   // 数据光滑过度
                    data: ranks.reverse()
                }]
            });
            // return rankBar;
        }
    });



    // 刷新表
    jQuery.extend({
        'flushView': function(names, ranks){
            rankBar.setOption({
                yAxis: {
                    data: names.reverse()       // 数组倒置
                },
                series: [{
                    name: 'rank',
                    type: 'bar',
                    smooth: true,
                    data: ranks.reverse()       // 数组倒置
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
            // console.log(data);
            // console.log(data.map(item => item.name));   // 获取属性数组
            names = data.map(item => item.name);    // 获取属性数组
            ranks = data.map(item => item.rating);
            // console.log(names);
            $.initView(names.slice(0, maxItemNum), ranks.slice(0, maxItemNum));
            // console.log(names);
            counter = 0;
            length = names.length;
            console.log(length);



            // 刷新图片点击事件
            $('.control:first').click(function(){
                // alert('点击了');
                // console.log(flushTimeout);
                if(flushTimeout != null){
                    clearInterval(flushTimeout);
                    flushTimeout = null;
                    $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                }
                counter = 0;
                $.initView(names.slice(0, maxItemNum), ranks.slice(0, maxItemNum));
                // flushTimeout = setInterval(function(){
                    // if(length - counter >= maxItemNum && counter > 0){
                        // $.flushView(names.slice(counter, counter + maxItemNum), ranks.slice(counter, counter+maxItemNum));
                    // }
                    // counter ++;
                    // if(length - counter < maxItemNum){
                        // console.log(counter);
                        // clearInterval(flushTimeout);
                        // flushTimeout = null;
                        // $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                    // }
                // }, period * 1000);
            });


            // 设置图片点击事件
            $('.setting:first').click(function(){
                // alert('设置选项');
                // $('body').css('opacity', '0.1');    // 设置主题背景透明度，子元素也会被设置，不灵活
                $('#rank').css('opacity', '0.1');
                $('#process').css('opacity', '0.1');
                $('h2').css('opacity', '0.1');
                $('#setting').css('visibility', 'visible');     // 设置选项可见
            });


            // 取消按钮点击事件
            $('#cancel').click(function(){
                // alert('取消');
                $('#rank').css('opacity', '1.0');
                $('#process').css('opacity', '1.0');
                $('h2').css('opacity', '1.0');
                $('#setting').css('visibility', 'hidden');     // 设置选项隐藏
            });


            // 确定按钮点击事件，不能放到图片点击事件中，否则重复绑定事件
            $('#confirm').click(function(){
                // alert('确定');
                // alert('this: ' + $(this).attr('id'));
                console.log('counter: ' + counter);
                console.log('length: ' + length);
                pFlag = false;  // 判断period是否改变
                mFlag = false;
                if($('#period').val().trim() != ''){
                    temp = parseInt($('#period').val().trim());
                    if(temp != period){
                        pFlag = true;       // period 改变
                        period = temp;
                    }
                }
                if($('#maxItemNum').val().trim() != ''){
                    temp = parseInt($('#maxItemNum').val().trim());
                    if(temp != maxItemNum){
                        mFlag = true;       // maxItemNum 改变
                        maxItemNum = temp;
                    }
                }
                console.log('period ' + period);
                console.log('maxItemNum ' + maxItemNum);
                $('#rank').css('opacity', '1.0');
                $('#process').css('opacity', '1.0');
                $('h2').css('opacity', '1.0');
                $('#setting').css('visibility', 'hidden');     // 设置选项隐藏

                // alert(flushTimeout);
                if(flushTimeout == null){       // 定时器已经关闭
                    if(mFlag){      // maxItemNum 改变
                        if(length - counter < maxItemNum){      // 回退，本来应该length - counter < maxItemNum - 1排除maxItemNum未改变情况，但由于mFlag为true，所以maxItemNum一定改变
                            counter = maxItemNum > length ? 0 : (length - maxItemNum);
                            $.flushView(names.slice(counter, length), ranks.slice(counter, length));
                        }else if(length - counter >= maxItemNum){       // 继续刷新
                            flushTimeout = setInterval(function(){
                                if(length - counter >= maxItemNum && counter > 0){
                                    $.flushView(names.slice(counter, counter + maxItemNum), ranks.slice(counter, counter + maxItemNum));
                                }
                                counter ++;
                                if(length - counter < maxItemNum){
                                    clearInterval(flushTimeout);
                                    flushTimeout = null;
                                    $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                                }
                            }, period * 1000);
                        }
                    }
                }else{      // 定时器仍然开启
                    if(pFlag){      // period改变
                        clearInterval(flushTimeout);
                        flushTimeout = null;
                        flushTimeout = setInterval(function(){
                            if(length - counter >= maxItemNum && counter > 0){
                                $.flushView(names.slice(counter, counter + maxItemNum), ranks.slice(counter, counter + maxItemNum));
                            }
                            counter ++;
                            if(length - counter < maxItemNum){
                                clearInterval(flushTimeout);
                                flushTimeout = null;
                                $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                            }
                        }, period * 1000);
                    }
                }
            });



            // 开始按钮点击事件
            $('.run').click(function(){
                if(flushTimeout == null){           // pause --> start
                    // alert('pause');
                    flushTimeout = setInterval(function(){
                        if(length - counter >= maxItemNum && counter > 0){
                            $.flushView(names.slice(counter, counter + maxItemNum), ranks.slice(counter, counter+maxItemNum));
                        }
                        counter ++;
                        if(length - counter < maxItemNum){
                            console.log(counter);
                            clearInterval(flushTimeout);
                            flushTimeout = null;
                            $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                        }
                    }, period * 1000);
                    console.log(flushTimeout);
                    $('.run').attr({'src':'./static/img/pause.png', 'title': '暂停', 'alt': '暂停'});
                }else{                              // start --> pause
                    // alert('start');
                    clearInterval(flushTimeout);
                    console.log('flushTimeout: ' + flushTimeout);
                    flushTimeout = null;
                    console.log('flushTimeout: ' + flushTimeout);
                    $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
                }
            });

            
        },
        error: function(err){
            window.location.href = '/error';
            console.error(err.responseText);
        }
        
    });








});