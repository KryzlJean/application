<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

// Read JSON body
$raw = file_get_contents("php://input");
$data = json_decode($raw);
if (!$data) {
  echo json_encode(["success" => false, "message" => "Invalid JSON body"]);
  exit();
}

$firstname = isset($data->firstname) ? trim($data->firstname) : '';
$lastname = isset($data->lastname) ? trim($data->lastname) : '';
$email = isset($data->email) ? trim($data->email) : '';
$password = isset($data->password) ? $data->password : '';
$phone = isset($data->phone_number) ? trim($data->phone_number) : '';

if ($firstname === '' || $lastname === '' || $email === '' || $password === '' || $phone === '') {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit();
}

$servername = "localhost";
$username   = "root";
$dbpassword = "";
$dbname     = "SmokeDetectiondb";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $conn = new mysqli($servername, $username, $dbpassword, $dbname);

  // Optional: check existing email
  $check = $conn->prepare("SELECT 1 FROM `User` WHERE `email` = ? LIMIT 1");
  $check->bind_param("s", $email);
  $check->execute();
  $check->store_result();
  if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    $check->close();
    $conn->close();
    exit();
  }
  $check->close();

  $hash = password_hash($password, PASSWORD_BCRYPT);
  $stmt = $conn->prepare("INSERT INTO `User` (`firstname`, `lastname`, `email`, `password`, `phone_number`) VALUES (?, ?, ?, ?, ?)");
  $stmt->bind_param("sssss", $firstname, $lastname, $email, $hash, $phone);
  $stmt->execute();

  echo json_encode(["success" => true, "message" => "User registered successfully"]);

  $stmt->close();
  $conn->close();
} catch (mysqli_sql_exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "DB error", "error" => $e->getMessage()]);
}