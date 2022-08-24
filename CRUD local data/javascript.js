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
var counter = 0;

// hàm khởi tạo
function Employee(name, department, phone) {
  this.id = ++counter;
  this.name = name;
  this.department = department;
  this.phone = phone;
}

function initEmployees() {
  if(employees != null && employees.length > 0) {
    return; // nếu có rồi thì thoát ra
  }
  // init data
  employees.push(new Employee("Nguyễn Văn A", "Administrator", "(+84) 123-4567"));
  employees.push(new Employee("Nguyễn Văn B", "Customer Service", "(+84) 258-5554"));
  employees.push(new Employee("Nguyễn Văn C", "Human Resources", "(+84) 565-5412"));
}

function buildTable() {
  setTimeout(function name(params) {
  
    // cho bảng trống đi để thêm lại toàn bộ khi cập nhật (làm tạm)
    $('tbody').empty();
    
    initEmployees();
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
    
  }, 500);
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
function addEmployee() {
  var name = document.getElementById("name").value;
  var department = document.getElementById("department").value;
  var phone = document.getElementById("phone").value;
  // TODO validate
  // if validate fail -> return
  
  // if validate success -> tiếp code sau
  employees.push(new Employee(name, department, phone));
  hideModal();
  showAlertSuccess();
  buildTable();
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
  
  var i = employees.findIndex(e => e.id == id);
  
  // update var trên vào list
  employees[i].name = name;
  employees[i].department = department;
  employees[i].phone = phone;
  
  // if validate success -> tiếp
  hideModal();
  showAlertSuccess();
  buildTable();
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
  var i = employees.findIndex(e => e.id == id);
  employees.splice(i,1); // hàm xoá xong phần tử thì dồn lại
  
  showAlertSuccess();
  buildTable();
}

