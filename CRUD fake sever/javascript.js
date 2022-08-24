$(function () {
  $(".header").load("header.html");
  $(".main").load("main.html");
  $(".footer").load("footer.html");
});

function clickNavHome() {
  $(".main").load("home.html");
}

function clickNavViewListEmployees() {
  $(".main").load("viewListEmployees.html");
  buildTable();
}
// ============Khởi tạo employee====================
var employees = []; // tạo list nhân viên

// hàm khởi tạo
function Employee(id, name, department, phone) {
  this.id = id;
  this.name = name;
  this.department = department;
  this.phone = phone;
}

function getListEmployees() {
  // call API from server
  $.get("https://62e2022c3891dd9ba8dec287.mockapi.io/employees", function(data,status){
    // reset list employees
    employees = [];
    // error
    if (status == "error") {
      alert("Error when loading data.");
      return;
    }
    // success
    parseData(data);
    fillEmployeeToTable();
  });
}

function parseData(data) {
  // với mỗi item của data tải từ server, lấy các field từ item qua việc khởi tạo employee và đẩy vào danh sách employees của mình để hiển thị lên html
  data.forEach(function(item) {
    employees.push(new Employee(item.id, item.name, item.department, item.phone));
  });
}

function fillEmployeeToTable() {
  employees.forEach(function(element) {
    $('tbody').append(
      '<tr>' +
        '<td>' + element.name + '</td>' +
        '<td>' + element.department + '</td>' +
        '<td>' + element.phone + '</td>' +
        '<td>' +
          '<a class="edit" title="Edit" data-toggle="tooltip" onclick="openModalUpdate('+ element.id +')"><i class="material-icons">&#xE254;</i></a>' +
          '<a class="delete" title="Delete" data-toggle="tooltip" onclick="openConfirmDelete('+ element.id +')"><i class="material-icons">&#xE872;</i></a>' +
        '</td>' +
      '</tr>')
  });
}

function buildTable() {
  // cho bảng trống đi để thêm lại toàn bộ khi cập nhật (làm tạm)
  $('tbody').empty();
  getListEmployees();
}

// ==============Modal Add===============
function openModalAdd() {
  resetForm();
  showModal();
}

// reset form thành các trường rỗng mỗi khi load lại
function resetForm() {
  document.getElementById("id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("department").value = "";
  document.getElementById("phone").value = "";
}


function showModal() {
  $('#myModal').modal('show');
}

function hideModal() {
  $('#myModal').modal('hide');
}

//=============Save has 2 case==============
function save() {
    var id = document.getElementById("id").value;
    if(id == null || id == "") {
      addEmployee();
    } else {
      updateEmployee();
    }
}

// cho save case add
function addEmployee() { // post = create, add
  // get data
  var name = document.getElementById("name").value;
  var department = document.getElementById("department").value;
  var phone = document.getElementById("phone").value;
  // TODO validate
  // if validate fail -> return
  
  // if validate success -> tiếp code sau
  // post những value đã điền từ modal lên data server
  var employee = {
      name: name,
      department: department,
      phone: phone
    } // post data user đã nhập theo dạng json
  $.post("https://62e2022c3891dd9ba8dec287.mockapi.io/employees",
    employee,
    function(data, status){
      // error
      if(status == "error"){
        alert("error when adding new employee");
        return;
      }
      // success
      hideModal();
      showAlertSuccess();
      buildTable();
    });
}

// ============Modal Update============
function openModalUpdate(id) {
  // get index from employee's id bằng loop kiểu viết lamda express '=>'
  var i = employees.findIndex(e => e.id == id);
  
  // fill data
  document.getElementById("id").value = employees[i].id; // field này ẩn
  document.getElementById("name").value = employees[i].name;
  document.getElementById("department").value = employees[i].department;
  document.getElementById("phone").value = employees[i].phone;
  
  // sau khi chuẩn bị hết thì show hộp tương tác
  showModal();
}

// cho save case update
function updateEmployee() {
  var id = document.getElementById("id").value; // tìm bằng id ẩn
  var name = document.getElementById("name").value; // user nhập info update rồi gán vào var
  var department = document.getElementById("department").value;
  var phone = document.getElementById("phone").value;
  // TODO validate
  // if validate fail -> return
  
  // if validate success -> tiếp
  var employee = {
    name: name,
    department: department,
    phone: phone
  }
  $.ajax({
    url: 'https://62e2022c3891dd9ba8dec287.mockapi.io/employees/' + id,
    type: 'PUT',
    data: employee,
    success: function(result) {
      // error
      if(result==undefined||result==null){
        alert("Error when deleting data");
        return;
      }
      // success
      hideModal();
      showAlertSuccess();
      buildTable();
    }
  })
}

function showAlertSuccess() {
  $("#success-alert").fadeTo(2000,500).slideUp(500,function() {
    $("#success-alert").slideUp(500);
  });
}

// ============Alert delete============
function openConfirmDelete(id) {
  var i = employees.findIndex(e => e.id == id);
  var name = employees[i].name;
  
  var result = confirm("Want to delete " + name + "?");
  if (result) { // nếu đúng, result là type boolean
    deleteEmployee(id);
  }
}

function deleteEmployee(id) {
  // TODO validate
  
  $.ajax({
    url: 'https://62e2022c3891dd9ba8dec287.mockapi.io/employees/' + id,
    type: 'DELETE',
    success: function(result) {
      // error
      if(result == undefined || result == null) {
        alert("Error when deleting data");
        return;
      }
      // success
      showAlertSuccess();
      buildTable();
    }
  })
}

