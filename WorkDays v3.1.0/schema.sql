-- Accounts table (admins + employees)
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','employee') NOT NULL
);

-- Settings (global payroll config)
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dailyRate DECIMAL(10,2),
  overTimeRate DECIMAL(10,2),
  firstCutoff DATE,
  secondCutoff DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll records
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  daysWorked INT,
  hoursWorked DECIMAL(5,2),
  overtimeHours DECIMAL(5,2),
  cutoff DATE,
  FOREIGN KEY (employee_id) REFERENCES accounts(id)
);

-- Insert default admin
INSERT INTO accounts (email, password, role)
VALUES ('admin@gmail.com', 'letmein456', 'admin');