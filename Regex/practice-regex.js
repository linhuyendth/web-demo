const phoneNumber = '123-555-999';

// cách thường dùng loop và hàm của str
function removeHyphensC1(str) {
  // trong khi chỉ số của "-" vẫn còn (tức phải = -1 thì mới không còn)
  while (str.indexOf('-') !== -1) {
    str = str.replace('-','');
  }
  return str;
}

// cách dùng flag g cho biểu thức /[- .]/
// có những kí tự đặc biệt như . $ nên muốn chuyển về kí tự thường thì dùng \. or \$
// dấu $ end (kết thúc của 1 chuỗi)
// dấu . là chọn tất nên muốn chọn dấu . ko thì dùng \. (escaped character)
// g : so khớp toàn bộ chuỗi cần tìm
function removeHyphensC2(str) {
  return str.replace(/-/g,'');
}

console.log(removeHyphensC1(phoneNumber));
console.log(removeHyphensC2(phoneNumber));

// cài nodejs rồi chỉnh ở system > about > advanced system settings > environment variables > sửa path = đường dẫn folder node js
// bấm ctrl + alt + N để run code


