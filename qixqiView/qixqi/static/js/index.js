// alert('hello');
/**
 * 1. splice 与 slice 区别：前者修改原数组，后者查询原数组
 * 2. 处理maxItemNum > length 的情况: 令maxItemNum = length;
 * 3. jquery/js 实现重载
 * 4. safari 取色器有些问题
 * 5. 设置更改后应不应该自动开启定时器
 * 6. 输入框禁用后更改样式，如背景颜色
 * 7. 设置栏弹出时，选中输入框中的文本
 * 8. 标签点击事件同时触发了单选按钮点击事件
 */

$(function(){
    // 配置信息
    var period = 1;     // 每隔1s刷新
    var maxItemNum = 10;     // 页面中最多展示10条结果

    var rankBar = echarts.init(document.getElementById('rank'));
    rankBar.showLoading();      // 打开loading动画

    var flushTimeout;    
    var clearFlag = false;      // 记录echarts表是否clear重建过
    var viewType = 'default';          // 当前哪一个界面 ('default'/'rating'/'user_count'/'week_recommend')


    // 排名策略
    /**
     * 总分值10分
     * (10 + 5 + 5)/2
     * rating: 直接映射到10分值
     * user_count: 500一分
     */
    jQuery.extend({
        'rank': function(rating, user_count, week_recommend){
            var result = rating;
            if(user_count < 2000){
                result += user_count/500 + 1;
            }else{
                result += 5;
            }
            if(week_recommend < 4){
                result += parseInt(week_recommend) + 1;
            }else{
                result += 5;
            }
            return (result / 2).toFixed(2);     // 保留两位小数
        }
    });


    // 利用jquery中sort()的自定义方法
    jQuery.extend({
        'sortRule': function(){
            return function(book1, book2){
                rank1 = $.rank(book1.rating, book1.user_count, book1.week_recommend);
                rank2 = $.rank(book2.rating, book2.user_count, book2.week_recommend);
                if(rank1 < rank2){        // 因为靠前的在下面，所以rank小
                    return 1;       // 交换位置
                }else if(rank1 > rank2){
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
                    itemStyle: {
                        normal: {
                            color: '#d11b1a'
                        }
                    },
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
                    itemStyle: {
                        normal: {
                            color: '#d11b1a'
                        }  
                    },
                    data: ranks.reverse()       // 数组倒置
                }]
            }); 
        }
    });


    // 搜索效果刷新
    jQuery.extend({
        'searchFlushView': function(names, ranks, index){
            rankBar.setOption({
                yAxis: {
                    data: names.reverse()
                },
                series: [{
                    name: 'rank',
                    type: 'bar',
                    smooth: true,
                    itemStyle:{
                        normal:{
                            color: function(params){
                                if(params.dataIndex == index){
                                    return '#00FF00';       // 选中颜色，绿色
                                }else{
                                    return '#d11b1a';
                                }
                            }
                        }
                    },
                    data: ranks.reverse()
                }]
            });
        }
    });


    // 简单搜索功能
    jQuery.extend({
        'simpleSearch': function(names, content){
            result = -1;
            $.each(names, function(index, value){       // 遍历数组
                // console.log('i = ' + index + ', content = ' + content + ', value = ' + value);
                if(content == value){
                    // console.log('叮咚');
                    result = index;
                    return false;       // 终止循环
                }
            });
            return result;
        }
    });


    // 自定义enter键盘事件
    jQuery.extend({
        'enterKeyDown': function(type){
            document.onkeydown = function(e){
                var ev = document.all ? window.event: e;
                if(ev.keyCode == 13){
                    if(type == null){
                        console.log('键绑定已经解除');
                    }else if(type == 'setting'){
                        // alert('设置确定');
                        $('#confirm').click();
                    }else if(type == 'search'){
                        // alert('搜索确定');
                        $('#search_confirm').click();
                    }
                }
            };
        }
    });


    // 小说rating总揽
    jQuery.extend({
        'modifyView': function(names, numbers, title, name){
            // console.log('names = ' + names);
            // console.log('numbers = ' + numbers);
            rankBar.clear();
            clearFlag = true;
            viewType = name;
            if(flushTimeout != null){
                clearInterval(flushTimeout);
                flushTimeout = null;
                $('.run').attr({'src': './static/img/start.png', 'title': '开始', 'alt': '开始'});
            }
            rankBar.setOption({
                title: {
                    text: title
                },
                tooltip: {},
                legend: {
                    data: [name]
                },
                xAxis: {
                    data: names
                },
                yAxis: {},
                series: [{
                    name: name,
                    type: 'line',
                    smooth: true,
                    data: numbers
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
            // ranks = data.map(item => item.rating);
            ranks = data.map(item => $.rank(item.rating, item.user_count, item.week_recommend));
            // console.log(names);
            $.initView(names.slice(0, maxItemNum), ranks.slice(0, maxItemNum));
            // console.log(names);
            counter = 0;
            length = names.length;
            console.log(length);



            // 刷新图片点击事件
            $('.control:first').click(function(){
                if(viewType != 'default'){      // 总览视图
                    // alert(viewType);
                    // rankBar.refresh();
                    option1 = rankBar.getOption();      // 重新加载动画
                    rankBar.clear();
                    rankBar.setOption(option1);
                    return;
                }

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
                if($('#search').css('visibility') == 'visible'){
                    $('#search').css('visibility', 'hidden');
                }
                $('#setting').css('visibility', 'visible');     // 设置选项可见
                $('#period').focus();       // 输入框获取焦点     
                $('#period').val(period);
                $('#maxItemNum').val(maxItemNum);
                $.enterKeyDown('setting');
            });


            // 标签获取焦点事件
            // label的for属性和focus事件同时设置时，会在label点击时触发两次单选按钮点击，所以取消for属性
            $('label.choice').focus(function(){
                // console.log(forId);
                // console.log('focus: ' + e);
                // console.log('-----------------------');
                // for(var target in e){
                    //     console.log(target);
                // }
                // console.log(e.type);
                // console.log(e.detail);
                // console.log(e.which);
                // console.log('-----------------------');
                // forId = $(this).attr('for');
                // console.log($('#'+forId).attr('checked'));
                // $('#'+forId).click();
                $(this).prev().click();
            });


            // 处理标签点击事件的同时，由于获取焦点，触发单选按钮点击事件
            // $('label.choice').click(function(e){
            //     // 防止事件冒泡，点击两次单选按钮
            //     // console.log(e.target);
            //     // if($(e.target).is('input')){        
            //     //     return;
            //     // }
            //     // forId = $(this).attr('for');
            //     // console.log(forId);
            //     e.stopPropagation();        // 阻止事件冒泡到focus
            // });
            


            // 取消按钮点击事件
            $('#cancel').click(function(){
                // alert('取消');
                $('#rank').css('opacity', '1.0');
                $('#process').css('opacity', '1.0');
                $('h2').css('opacity', '1.0');
                $('#setting').css('visibility', 'hidden');     // 设置选项隐藏
                $.enterKeyDown(null);       // 解除键绑定
            });


            // 确定按钮点击事件，不能放到图片点击事件中，否则重复绑定事件
            $('#confirm').click(function(){
                // 获取单选按钮的值
                // choice = $('input[type="radio"].choice').length;
                choice = $('input:radio:checked.choice').val();
                // alert(choice);
                if(choice != 'default'){
                    real_names = data.map(item => item.name);
                    if(choice == 'rating'){
                        ratings = data.map(item => item.rating);
                        // console.log('real_names = ' + real_names);
                        // console.log('ratings = ' + ratings);
                        $.modifyView(real_names, ratings, '评分榜', 'rating');
                    }else if(choice == 'user_count'){
                        user_counts = data.map(item => item.user_count);
                        $.modifyView(real_names, user_counts, '用户点击榜', 'user_count');
                    }else if(choice == 'week_recommend'){
                        week_recommends = data.map(item => item.week_recommend);
                        $.modifyView(real_names, week_recommends, '周推荐榜', 'week_recommend');
                    }
                    $('#rank').css('opacity', '1.0');
                    $('#process').css('opacity', '1.0');
                    $('h2').css('opacity', '1.0');
                    $('#setting').css('visibility', 'hidden');     // 设置选项隐藏
                    $.enterKeyDown(null);       // 解除键绑定

                    // img标签没有disabled属性，可以CSS中的pointer-events: none代替
                    // $('.control:first-child').attr('disabled', true);
                    // $('.run').attr('disabled', true);
                    // $('.search').attr('disabled', true);
                    // $('.control:first-child').css({'pointer-events': 'none'});
                    $('.run').css({'pointer-events': 'none'});
                    $('.search').css({'pointer-events': 'none'});
                    return;
                }

                if(clearFlag){      // echarts重建过
                    rankBar.clear();
                    end = (maxItemNum > length) ? length : counter + maxItemNum;
                    $.initView(names.slice(counter, end), ranks.slice(counter, end));
                    clearFlag = false;
                    viewType = 'default';
                    // $('.control:first-child').attr('disabled', false);
                    // $('.run').attr('diabled', false);
                    // $('.search').attr('disabled', false);
                    // $('.control:first-child').css({'pointer-events': 'auto'});
                    $('.run').css({'pointer-events': 'auto'});
                    $('.search').css({'pointer-events': 'auto'});
                }


                // alert('确定');
                // alert('this: ' + $(this).attr('id'));
                console.log('counter: ' + counter);
                console.log('length: ' + length);
                pFlag = false;  // 判断period是否改变
                mFlag = false;
                if($('#period').val().trim() != ''){
                    // alert($('#period').val());
                    temp = parseFloat($('#period').val().trim());
                    if(temp != period){
                        pFlag = true;       // period 改变
                        period = temp;
                    }
                    // alert(period);
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
                $.enterKeyDown(null);       // 解除键绑定

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


            // 单选按钮选中事件
            var inputDisabledFlag = false;      // 记录是否是disabled
            $('input:radio[name="choice"]').click(function(){
                choice = $('input:radio:checked.choice').val();
                if(choice != 'default' && !inputDisabledFlag){
                    $('#period').attr('disabled', true);
                    $('#maxItemNum').attr('disabled', true);
                    $('#period').val(period);
                    $('#maxItemNum').val(maxItemNum);
                    inputDisabledFlag = true;
                }
                
                if(choice == 'default' && inputDisabledFlag){
                    $('#period').attr('disabled', false);
                    $('#maxItemNum').attr('disabled', false);
                    inputDisabledFlag = false;
                }
            });






            // 开始/播放按钮点击事件
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



            // 搜索图片点击事件
            $('.search').click(function(){
                // alert('搜索');
                // $('div:visible').css('opacity', '0.1');
                $('#rank').css('opacity', '0.1');
                $('#process').css('opacity', '0.1');
                $('h2').css('opacity', '0.1');
                if($('#setting').css('visibility') == 'visible'){
                    $('#setting').css('visibility', 'hidden');
                }
                // $('.setting').off('click');     // setting点击方法禁用
                // $('.setting').attr('disabled', 'disabled');
                $('#search').css('visibility', 'visible');
                $('#search_content').focus();
                $.enterKeyDown('search');
            });


            // 搜索取消按钮点击事件
            $('#search_cancel').click(function(){
                $('#rank').css('opacity', '1.0');
                $('#process').css('opacity', '1.0');
                $('h2').css('opacity', '1.0');
                $('#search').css('visibility', 'hidden');
                $.enterKeyDown(null);       // 解除键绑定
                // $('.setting').on('click');
                // $('.setting').attr('disabled', false);
                // $('div:hidden').css('opacity', '1.0');
            });


            // 搜索确定按钮点击事件
            $('#search_confirm').click(function(){
                // alert('搜索');
                content = $('#search_content').val().trim();
                if(content == ''){
                    alert('empty');
                }else{
                    index = $.simpleSearch(names, content);
                    // alert(index);
                    if(index == -1){
                        alert('未找到该条目');
                    }else if(index + maxItemNum <= length){
                        counter = index;
                        $.searchFlushView(names.slice(counter, counter+maxItemNum), ranks.slice(counter, counter+maxItemNum), maxItemNum-1);       // 数组倒置了
                    }else{
                        counter = maxItemNum > length ? 0 : (length - maxItemNum);
                        $.searchFlushView(names.slice(counter, length), ranks.slice(counter, length), length-index-1);      // 数组倒置了
                    }
                }
                $('#rank').css('opacity', '1.0');
                $('#process').css('opacity', '1.0');
                $('h2').css('opacity', '1.0');
                $('#search').css('visibility', 'hidden');
                $.enterKeyDown(null);       // 解除键绑定
            });

            
        },
        error: function(err){
            window.location.href = '/error';
            console.error(err.responseText);
        }
        
    });








});