$(function () {
  // nếu chưa login thì luôn trả về trang login
  if (!isLogin()) {
    window.location.replace("http://127.0.0.1:5500/login.html");
  }
  // còn nếu login rồi thì load nội dung trang
  $("#header").load("header.html", function () {
    // phải load xong header thì mới cho hiển thị tên đăng nhập
    document.getElementById("fullName").innerHTML = localStorage.getItem("FULL_NAME");
  });
  $("#main").load("home.html");
  $("#footer").load("footer.html");
departments = [];
});

function isLogin() {
  if (localStorage.getItem("ID")) {
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem("ID");
  localStorage.removeItem("FULL_NAME");
  localStorage.removeItem("USER_NAME");
  localStorage.removeItem("EMAIL");
  localStorage.removeItem("PASSWORD");
  // redirect sang trang login
  window.location.replace("http://127.0.0.1:5500/login.html");
}

function clickNavHome() {
  $("#main").load("home.html");
  departments = [];
}

function clickNavViewListDepartments() {
  $("#main").load("viewListDepartments.html", function() {
    // sau khi load trang view list xong thì liền thực hiện function này cho 
    buildTable();
  });
  // chứ để buildTable() ở đây sẽ phải click nav view lần nữa mới chạy
}

// ============ Paging Sorting Department====================
var departments = []; // tạo list phòng ban
var currentPage = 1; // mặc định cho trang hiện tại là 1
var size = 3; // cho hiện 4 bản ghi
var sortField = 'modifiedDate';
// mặc định set desc để khi add sẽ đưa kết quả vừa add lên trang đầu
var isAsc = false;

var minCreatedDate = '';
var maxCreatedDate = '';

function getListDepartments() {
  var url = 'http://localhost:8080/api/v1/departments';
  url += '?page=' + currentPage + '&size=' + size; 
  url += '&sort=' + sortField + ',' + (isAsc? 'asc':'desc');
  
  var search = document.getElementById('input-search-department').value; // lấy thẳng giá trị search luôn mỗi khi nhập, chứ làm 1 biến rỗng sẽ gây lỗi khi xoá hết thanh search nhưng ko trở về như cũ và sort dc nữa 
  
  if (search) { // nếu có search
    // ở đây điều kiện trên tương đương với dòng sau:
    // seach !== null && search !== undefined && search.length > 0
    url += '&search=' + search; 
  }
  
  // gọi API
  $.ajax({
    url: url,
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json', // datatype return in method get in controller
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function(data, textStatus, xhr) {
      // reset list departments
      departments = [];
      departments = data.content;
      fillDepartmentToTable();
      resetCheckboxAll();
      pagingTable(data.totalPages);
      renderSortUI();
    },
    error(jqXHR, textStatus, errorThrown){
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

function resetSearch() {
  document.getElementById('input-search-department').value = '';
}

function handleSearch() {
  // khi mà thực hiện search chỉ cần build lại table thôi
  // thì trong build table sẽ tự động lấy hứng ô search vào biến search luôn trong hàm getListDepartments()
  resetPage();
  resetSort();
  resetCheckboxAll();
  buildTable();
}

function enterForSearch(event) {
  // https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
  // number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    handleSearch();
  }
}

function renderSortUI() {
  var sortTypeClass = isAsc? 'fa-sort-asc':'fa-sort-desc';
  // keyword search: add/remove class to element in js
  
  switch (sortField) {
    case 'name':
      changeIconSort('th-name', sortTypeClass);
      // reset lại về fa-sort
      changeIconSort('th-author', 'fa-sort');
      changeIconSort('th-createdDate', 'fa-sort');
      break;
    case 'author.fullName':
      changeIconSort('th-author', sortTypeClass);
      changeIconSort('th-name', 'fa-sort');
      changeIconSort('th-createdDate', 'fa-sort');
      break;
    case 'createdDate':
      changeIconSort('th-createdDate', sortTypeClass);
      changeIconSort('th-name', 'fa-sort');
      changeIconSort('th-author', 'fa-sort');
      break;
  
    default: // mặc định nếu mà chưa sort gì cả thì hiển thị icon fa-sort ở các cột lên
      // remove tất cả trước khi add thêm
      changeIconSort('th-name', 'fa-sort');
      changeIconSort('th-author', 'fa-sort');
      changeIconSort('th-createdDate', 'fa-sort');
      break;
  }
}

function changeIconSort(id, sortTypeClass) {
  document.getElementById(id).classList.remove('fa-sort', 'fa-sort-asc', 'fa-sort-desc');
  document.getElementById(id).classList.add(sortTypeClass);
}

function pagingTable(pageNums) {
  var pagingStr = '';

  // nếu số page > 1 thì thêm previous, số page và next
  if (pageNums > 1 && currentPage > 1) {
    pagingStr += 
      '<li class="page-item">' +
        '<a style="border-radius: 0px" class="page-link" onclick="previousPage()">Previous</a>' +
      '</li>';
  }
  
  for (let i = 0; i < pageNums; i++) {
    pagingStr +=
      '<li class="page-item '+ (currentPage == (i + 1) ? 'active' : '') + '" style="border-radius: 0px;">' +
        '<a style="border-radius: 0px;" class="page-link" onclick="changePage('+ (i + 1) +')">' + (i + 1) + '</a>' +
      '</li>';
    // cho .active vào thẻ <a> hay <li> đều ok
  }
  
  if (pageNums > 1 && currentPage < pageNums) {
    pagingStr += 
    '<li class="page-item">' + 
      '<a style="border-radius: 0px" class="page-link" onclick="nextPage()">Next</a>' + 
    '</li>';
  }

  $('#pagination').empty();
  $('#pagination').append(pagingStr); // đưa các <li> vào <ul>
}

function resetPage() { // để sau khi delete từ set về trang 1
  currentPage = 1;
  size = 3;
}

function changePage(page) {
  if (page == currentPage) {
    return; // nếu onclick vào page 1 = currentPage thì ko xảy ra gì cả, return luôn
  }
  // còn nếu onclick vào page khác thì
  currentPage = page;
  buildTable(); // làm empty tbody và get list lại
}

function previousPage() {
  changePage(currentPage - 1);
}

function nextPage() {
  changePage(currentPage + 1);
}

function changeSort(field) { // chuyển đổi asc, desc cho các fields trong table
  if (field == sortField) {
    isAsc = !isAsc; // nếu mà bấm vào nút sort field thì sẽ đảo chiều sort
  } else { // còn lại các field khác reset lại là asc
    sortField = field; // field khác
    isAsc = true;
  }
  buildTable();
}

function resetSort() {
  sortField = 'modifiedDate';
  isAsc = false;
}

function resetTable() {
  resetPage();
  resetSort();
  resetSearch();
  // resetFilter();
  resetCheckboxAll();
}

function resetCheckboxAll() {
  // reset checkboxAll
  document.getElementById("checkbox-all").checked = false;

  // reset checkbox cho các elements
  var i = 0;
  while (true) {
    var checkboxElement = document.getElementById("checkbox-" + i);
    // nếu tìm thấy những checkbox con thì
    if (checkboxElement !== undefined && checkboxElement !== null) {
      // reset luôn cho các check box con
      checkboxElement.checked = false;
      i++;
    } else {
      break;
    }
  }
}

function fillDepartmentToTable() {
  departments.forEach(function(element, index) {
    $('tbody').append(
      '<tr>' +
        '<td><input type="checkbox" onclick="onchangeCheckboxElement()" id="checkbox-' + index + '"></td>' +
        '<td>' + element.name + '</td>' +
        '<td>' + element.author.fullName + '</td>' +
        '<td>' + element.createdDate + '</td>' +
        '<td>' +
          '<a class="edit" title="Edit" data-toggle="tooltip" onclick="openModalUpdate('+ element.id +')"><i class="material-icons">&#xE254;</i></a>' +
          '<a class="delete" title="Delete" data-toggle="tooltip" onclick="openConfirmDelete('+ element.id +')"><i class="material-icons">&#xE872;</i></a>' +
        '</td>' +
      '</tr>')
  });
}

function buildTable() {
  // cho bảng trống đi để thêm lại toàn bộ khi load lại
  $('tbody').empty();
  getListDepartments();
}

// ==============Modal Add===============
function openModalAdd() {
  showModal(); // open modal trước rồi mới reset form
  resetFormAdd();
}

// reset form thành các trường rỗng mỗi khi load lại
function resetFormAdd() {
  document.getElementById("titleModal").innerHTML = "Add Department";
  document.getElementById("id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("authorLabel").style.display = "none";
  document.getElementById("author").style.display = "none";
  document.getElementById("createdDateLabel").style.display = "none";
  document.getElementById("createdDate").style.display = "none";
  hideNameErrorMes();
}

function hideNameErrorMes() {
  document.getElementById("nameErrorMes").style.display = "none";
}

function showNameErrorMes(mes) {
  document.getElementById("nameErrorMes").style.display = "block";
  document.getElementById("nameErrorMes").innerHTML = mes;
}

function showModal() {
  $('#myModal').modal('show');
}

function hideModal() {
  $('#myModal').modal('hide');
}

//=============Save có 2 trường hợp==============
function save() {
    var id = document.getElementById("id").value;
    if (id == null || id == "") {
      addDepartment();
    } else {
      updateDepartment();
    }
}

// TH1: save add
function addDepartment() { // post = create, add
  // get name department để validate
  var name = document.getElementById("name").value;
  
  // validate check name length
  if (!name || name.length < 3 || name.length > 30) {
    showNameErrorMes("Department name must be from 3 to 30 characters!")
    return; // thoát lệnh save để ko lưu xuống db
  }
  
  // validate unique name
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/" + name + "/exists",
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function(data, textStatus, xhr) {
      // check data
      if (data) { // nếu tồn tại thì show error mes
        showNameErrorMes("This department name already exists!")  
      } else { // nếu ko tồn tại thì gọi api để create
        // post những value đã điền từ modal lên data server
        var department = {
          name: name,
          authorId: 3
        };

        // post data user đã nhập theo dạng json
        $.ajax({
          url: 'http://localhost:8080/api/v1/departments',
          type: 'POST',
          data: JSON.stringify(department), // convert value js sang string json
          contentType: "application/json", // type of body (json, xml, text)
          // dataType: 'json', // datatype return in method post in controller (ở đây đang trả về String nên cmt lại)
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
          },
          success: function(data, textStatus, xhr) {
            hideModal();
            showAlertSuccess();
            resetTable(); // reset hết trước khi gọi lại api để build table
            buildTable();
            console.log(data); // hiện ra Created successfully! của mình
            console.log(textStatus); // success
          },
          error(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
          }
        });
      }
    },
    error(jqXHR, textStatus, errorThrown){
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

// ============Modal Update============
function resetFormUpdate() {
  document.getElementById("titleModal").innerHTML = "Update Department";
  document.getElementById("authorLabel").style.display = "block";
  document.getElementById("author").style.display = "block";
  document.getElementById("createdDateLabel").style.display = "block";
  document.getElementById("createdDate").style.display = "block";
  hideNameErrorMes();
}

var oldName;

function openModalUpdate(id) {
  // phải gọi api get data lên đã để user ko thấy form trống khi chưa load data xong
  // call API from server
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/" + id,
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json', // datatype return
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function (data, textStatus, xhr) {
      // success
      showModal();
      resetFormUpdate();
      
      oldName = data.name;
      
      // fill data
      document.getElementById("id").value = data.id;
      document.getElementById("name").value = data.name;
      document.getElementById("author").value = data.author.fullName;
      document.getElementById("createdDate").value = data.createdDate;
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

// TH2: save update
function updateDepartment() {
  var id = document.getElementById("id").value; // tìm bằng id ẩn
  var name = document.getElementById("name").value; // user nhập info update rồi gán vào var
  
  // validate check name length
  if (!name || name.length < 3 || name.length > 30) {
    showNameErrorMes("Department name must be from 3 to 30 characters!");
    return; // thoát lệnh save để ko lưu xuống db
  }
  
  // validate unique name
  if (oldName == name) { // nếu tên ko update gì
    // thì vẫn cho thông báo save thành công bình thường rồi return luôn để khỏi chạy những hàm dưới nữa
    hideModal();
    showAlertSuccess();
    resetTable();
    buildTable();
    return;
  }

  // validate unique name
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/" + name + "/exists",
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function(data, textStatus, xhr) {
      // check data
      if (data) { // nếu tồn tại thì show error mes
        showNameErrorMes("This department name already exists!")  
      } else { // nếu ko tồn tại thì gọi api để update
        // put những value đã điền từ modal lên data server
        var department = {
          name: name
        };
        
        // put data user đã nhập theo dạng json
        $.ajax({
          url: 'http://localhost:8080/api/v1/departments/' + id,
          type: 'PUT',
          data: JSON.stringify(department), // body
          // convert value js sang string json
          contentType: "application/json", // type of body (json, xml, text)
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
          },
          // if success
          success: function(data, textStatus, xhr) {
            hideModal();
            showAlertSuccess();
            resetTable();
            buildTable();
            console.log(data); // hiện ra Updated successfully!
          },
          // if error
          error(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
          }
        });
      }
    },
    error(jqXHR, textStatus, errorThrown){
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

function showAlertSuccess() {
  $("#success-alert").fadeTo(2000,500).slideUp(500,function() {
    $("#success-alert").slideUp(500);
  });
}

// ============Alert delete============
function openConfirmDelete(id) {
  // có thể dùng api get by id ở trên để gọi obj cần delete nhưng ở đây lấy sẵn id lúc get all luôn
  var i = departments.findIndex(e => e.id == id);
  var name = departments[i].name;
  
  var result = confirm("Do you want to delete " + name + "?");
  if (result) { // nếu đúng, result là type boolean
    deleteDepartment(id);
  }
}

function deleteDepartment(id) {
  // TODO validate
  // trước khi xoá thì phải check xem id đó có còn hay ko
  // nếu còn thì cho xoá đi bằng mấy code dưới
  // nếu ko còn thì show alert kêu refresh lại trang vì data trong tab trang này đã cũ
  $.ajax({
    url: 'http://localhost:8080/api/v1/departments/' + id,
    type: 'DELETE',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function(result) {
      // error
      if(result == undefined || result == null) {
        alert("Error when deleting data");
        return;
      }
      // success
      showAlertSuccess();
      resetTable(); // phải reset hết trước khi build lại table
      buildTable();
    }
  });
}

// ==============Delete All===============
function onchangeCheckboxElement() {
  var i = 0;
  while (true) {
    var checkboxElement = document.getElementById("checkbox-" + i);
    // nếu tìm thấy những id cần xoá thì
    if (checkboxElement !== undefined && checkboxElement !== null) {
      // kiểm tra nếu có 1 id chưa dc check box thì
      if (!checkboxElement.checked) {
        // cho checkboxAll ko dc tích nữa và thoát loop
        document.getElementById("checkbox-all").checked = false;
        return;
      }
      i++;
    } else {
      break;
    }
  }
  document.getElementById("checkbox-all").checked = true;
}

function onchangeCheckboxAll() {
  var i = 0;
  while (true) {
    var checkboxElement = document.getElementById("checkbox-" + i);
    if (checkboxElement !== undefined && checkboxElement !== null) {
      checkboxElement.checked = document.getElementById("checkbox-all").checked
      // giải thích cho luồng hoạt động của dòng trên
      // if (document.getElementById("checkbox-all").checked) {
      //   checkboxElement.checked = true;
      // } else {
      //   checkboxElement.checked = false;
      // }
      i++;
    } else {
      break;
    }
  }
}

function deleteAllDepartments() {
  // get checked
  var ids = [];
  var i = 0;
  var names = [];
  
  while(true) {
    var checkboxElement = document.getElementById("checkbox-" + i);
    if (checkboxElement !== undefined && checkboxElement !== null) {
      if (checkboxElement.checked) {
        ids.push(departments[i].id);
        names.push(departments[i].name);
      }
      i++;
    } else {
      break;
    }
  }
  
  // sau khi viết 1 đoạn code dài thì nên console.log() kiểm thử
  console.log(ids);
  
  // confirm
  var result = confirm("Do you want to delete " + names + "?");
  if (result) {
    // nếu đúng thì gọi api lên để delete
    $.ajax({
      url: 'http://localhost:8080/api/v1/departments?ids=' + ids,
      type: 'DELETE',
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USER_NAME") + ":" + localStorage.getItem("PASSWORD")));
      },
      success: function(result) {
        // error
        if(result == undefined || result == null) {
          alert("Error when deleting data");
          return;
        }
        // success
        showAlertSuccess();
        resetTable(); // phải reset hết trước khi build lại table
        buildTable();
      }
    });
  } // nếu ko thì chẳng có gì xảy ra cả
}