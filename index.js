let tbody = document.getElementById('tbody');
const modalForm = document.getElementsByClassName('modal-form')[0];
let tableData = null;
let editData = null;

function saveData(url, param) {
    let result = null;
    let xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        let str = "";
        for (let prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}

//初始化执行函数
(function () {
    bindEvent();
    getTableData();
})();

//绑定页面所有事件
function bindEvent() {
    //导航点击事件
    const menuList = document.querySelector('.student-menu');
    menuList.addEventListener('click', function (e) {
        if (e.target.tagName === 'DD') {
            const activeDel = document.querySelectorAll('.active');
            initStyle(activeDel, 'active', e.target);
        }
        const id = e.target.getAttribute('for');
        //获取目标标签for的属性值
        const rightContent = document.getElementById(id);
        // 寻找id为for属性值的标签
        const activeContent = document.getElementsByClassName('content-active');
        // 选出所有带content-active class类名的标签 将标签的类名删除
        initStyle(activeContent, 'content-active', rightContent);
        if(id==='student-list'){
            getTableData();
        }
    })
    //添加学生点击事件
    const addStudentBtn = document.getElementById('addStudentBtn');
    addStudentBtn.onclick = function (e) {
        e.preventDefault();
        const addStudentForm = document.getElementsByClassName('add-form')[0];
        const resultData = formFormat(addStudentForm);
        if (resultData.msg) {
            alert(resultData.msg);
            return;
        } else {
            const resp = saveData(`http://open.duyiedu.com/api/student/addStudent
          `, Object.assign({}, {appkey: 'zf_yyy_1569734712113'}, resultData.datas));
            if (resp.status === 'success') {
                alert("添加成功");
                const addStudentForm = document.getElementsByClassName('add-form')[0];
                addStudentForm.reset();
                const backStudentList = document.getElementsByClassName('student-list-btn')[0];
                backStudentList.click();
            } else {
                alert(resp.msg);
            }
        }
    }
    //编辑删除点击事件
    tbody.onclick = function (e) {
        const idEdit = e.target.classList.value.split(" ").includes("edit");
        let index = e.target.getAttribute('data-index');
        let data = tableData[index];
        if (idEdit) {
            //编辑按钮
            const modal = document.getElementsByClassName('modal')[0];
            modal.style.display = 'block'
            tableEditRender(data);
        } else {
            //删除按钮
            const response = saveData('http://open.duyiedu.com/api/student/delBySno', {
                appkey: 'zf_yyy_1569734712113',
                sNo:data.sNo
            })
            if(response.status === 'success'){
                alert("删除成功");
                getTableData();
            }else{
                alert(response.msg);
            }
        }
    }

}

function tableEditRender(data) {

    for (const props in data) {
        if (modalForm[props])
            modalForm[props].value = data[props];
    }

    const modalBtn = document.getElementById('modal-btn');
    modalBtn.onclick = function () {
        editData = formFormat(modalForm);
        const editResp = saveData(`http://open.duyiedu.com/api/student/updateStudent`,
            Object.assign({}, {appkey: 'zf_yyy_1569734712113'}, editData.datas));
        if (editResp.status === 'success') {
            alert("修改成功");
            modalForm.reset();
            const backStudentList = document.getElementsByClassName('student-list-btn')[0];
            backStudentList.click();
        } else {
            alert(editResp.msg);
        }
    }
}

//渲染表单显示到页面
function renderTable(datas) {
    let trs = ""
    datas.forEach((item, index) => {
        trs +=
            `<tr>  
          <td>${item.sNo}</td>
          <td>${item.name}</td>
          <td>${item.sex === 0 ? '男' : '女'}</td>
          <td>${item.email}</td>
          <td>${new Date().getFullYear() - item.birth}</td>
          <td>${item.phone}</td>
         <td>${item.address}</td>
         <td>
        <span class="btn edit" data-index=${index}>修改</span>
        <span class="btn delete" data-index=${index}>删除</span>
        </td>
        </tr>`
    })
    tbody.innerHTML = trs;
}

//获取表单数据
function getTableData() {
    const resp = saveData('http://open.duyiedu.com/api/student/findAll', {appkey: 'zf_yyy_1569734712113'});
    const datas = resp.data;
    if (resp.status === 'success') {
        tableData = datas;
        renderTable(tableData);
    } else {
        alert(resp.msg);
    }
}


//校验表单输入
function formFormat(form) {

    const result = {
        datas: {},
        msg: ""
    }
    const name = form.name.value;
    const sex = form.sex.value;
    const email = form.email.value;
    const sNo = form.sNo.value;
    const birth = form.birth.value;
    const phone = form.phone.value;
    const address = form.address.value;
    if (name && sex && email && sNo && birth && phone && address) {
        result.datas = {
            name,
            sex,
            email,
            sNo,
            birth,
            phone,
            address
        }
    } else {
        result.msg = "信息不全"
    }
    return result;
}

//替换class类名
function initStyle(removeDom, className, target) {
    for (let i = 0; i < removeDom.length; i++) {
        removeDom[i].classList.remove(className);
    }
    target.classList.add(className);
}

