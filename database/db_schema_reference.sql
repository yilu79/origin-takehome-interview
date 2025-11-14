-- ORIGIN TAKEHOME INTERVIEW - DATABASE REFERENCE SCHEMA
-- Provided for documentation only. You don't need to run this.

CREATE TABLE therapists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  therapist_id INT REFERENCES therapists(id),
  patient_id INT REFERENCES patients(id),
  date TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('Scheduled','Completed')) DEFAULT 'Scheduled'
);

-- Example Data
INSERT INTO therapists (name, specialty) VALUES
('Anna SLP', 'Speech Therapy'),
('Becca OT', 'Occupational Therapy'),
('Carlos PT', 'Physical Therapy');

INSERT INTO patients (name, dob) VALUES
('Ariel Underwood', '2018-06-15'),
('Nemo Fisher', '2017-03-02'),
('Moana Lee', '2016-12-25'),
('Elsa Frost', '2019-09-10');

INSERT INTO sessions (therapist_id, patient_id, date, status) VALUES
(1, 1, '2025-11-08 09:00:00', 'Scheduled'),
(1, 2, '2025-11-08 10:30:00', 'Scheduled'),
(1, 3, '2025-11-08 13:00:00', 'Completed'),
(2, 4, '2025-11-09 11:00:00', 'Scheduled'),
(3, 2, '2025-11-09 15:30:00', 'Scheduled');