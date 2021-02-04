DELIMITER //
CREATE function F_Get_min_times_played (category INT)
returns int deterministic
begin
    DECLARE val INT DEFAULT 0;
    Select min(times_played) into val from questions where  question_type = category;

    return val;
end //
DELIMITER //
CREATE function F_Get_namespaceID_for_namespace (namespace varchar(255))
returns int deterministic
begin
    DECLARE val INT DEFAULT 0;
    select id into val from active_namespaces an where an.is_active = 1 and namespace_identifier like namespace;

    return val;
end //

DELIMITER //
Create PROCEDURE team_exists(IN team_name varchar(100))
BEGIN
    Select name from teams where name like  lower(team_name);
END //

DELIMITER //

Create PROCEDURE email_exists(IN email varchar(100))
BEGIN
    Select email from users where users.email like  lower(email);
END //

DELIMITER //
Create PROCEDURE add_team(IN team_name varchar(100))
BEGIN
    INSERT into teams(NAME, ROLE, CREATEDAT, UPDATEDAT)
    VALUES(lower(team_name), 'ROLE_USER', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
END //

DELIMITER //
Create PROCEDURE add_user(IN fname varchar(255),IN lname varchar(255), IN e_mail varchar(255), IN pass varchar(16),in phone_nb varchar(1000), IN teamID INT)
BEGIN
    insert into users(first_name, last_name, email, password, phone, team_id, role, createdAt, updatedAt)
                                        values (fname, lname, lower(e_mail),  pass,phone_nb, teamID,
                                        'ROLE_USER', current_timestamp, current_timestamp);
END //


DELIMITER //
Create PROCEDURE get_team_id(IN team_name varchar(255))
BEGIN
    Select id from teams where name like lower(team_name);
END //

DELIMITER //
Create PROCEDURE user_allowed_inNamespace(IN Namespace varchar(255), IN team_ID int)
BEGIN
    Select 'true' from users_active_namespaces uan join active_namespaces an on uan.active_namespace_id = an.id
    where is_active = 1 and  namespace_identifier like Namespace and team_id = team_ID;
END //

DELIMITER //
Create PROCEDURE GetUserByEMAIL(IN email varchar(255))
BEGIN
    select id, concat(first_name,' ', last_name) as 'full_name', email,
                                                    password, phone,  team_id, is_active, role, createdAt,
                                                    updatedAt from users where email like lower(email);
END //
DELIMITER //
Create PROCEDURE GetUserByID(IN ID int)
BEGIN
    select id, concat(first_name,' ', last_name) as 'full_name', email,
                                                    password, phone,  team_id, is_active, role, createdAt,
                                                    updatedAt  from users where id like ID;
END //

DELIMITER //
Create PROCEDURE GetQuestion(IN category int, in team1_ID int, IN team2_ID int)
BEGIN
    select id, question, times_played from  questions
                                where times_played like F_Get_min_times_played(category)
                                AND id not in (
                                                Select question_id from answers_recieved where team_id in ( Select team_id from users where id in (team1_ID, team2_ID))
                                                )
                                AND question_type = category
                                order by RAND()
                                limit 1;
END //
DELIMITER //
Create PROCEDURE GetQuestion_Answers(IN Q_id int)
BEGIN
    Select id, answer from answers where question_id = Q_id order by rand();
END //

DELIMITER //
Create PROCEDURE Change_question_counter(IN counter int, IN question_ID INT)
BEGIN
    UPDATE questions set times_played = counter where id = question_ID;
END //

DELIMITER //
Create PROCEDURE GetQuestion_By_ID(IN Q_id int)
BEGIN
    select question from questions where id = Q_id;
END //

DELIMITER //
Create PROCEDURE GetAnswers_By_QuestionID(IN Q_id int)
BEGIN
    Select id, answer from answers where question_id = Q_id order by rand();
END //

DELIMITER //
Create PROCEDURE Get_User_TeamID(IN T_id int)
BEGIN
    Select team_id from users where id  = T_id;
END //

DELIMITER //
Create PROCEDURE Get_Answers_Question(IN ANS_ID int)
BEGIN
    Select question_id from answers where id like ANS_ID;
END //

DELIMITER //
Create PROCEDURE ADD_time_total(IN team int, IN ans_id INT, in Quest_ID int, IN time_total varchar(255))
BEGIN
    INSERT INTO answers_recieved(team_id, answer_id, question_id, total_time, createdAt, updatedAt)
                                Values(team,ans_id,Quest_ID,time_total,  current_timestamp, current_timestamp);
END //

DELIMITER //
Create PROCEDURE Get_User_role()
BEGIN
    Select id, name from teams where role like 'ROLE_USER';
END //

DELIMITER //
Create PROCEDURE GetTeamsInNamespaceDetails( IN namespace varchar(255))
BEGIN
    select t.id teamID, t.name as teamName, u.id as userID, concat(u.first_name, ' ', u.last_name) as name, t.role, uan.total_points
                                                        from users_active_namespaces uan join teams t on uan.team_id = t.id join users u on t.id = u.team_id
                                                        WHERE active_namespace_id = F_Get_namespaceID_for_namespace (namespace);
END //

DELIMITER //
Create PROCEDURE Check_namespace_existence( IN namespace varchar(255))
BEGIN
    select id from active_namespaces where namespace_identifier like namespace;
END //

DELIMITER //
Create PROCEDURE Update_scores( IN teamID int, IN namespace_id  INT)
BEGIN
    insert into  users_active_namespaces(team_id, active_namespace_id, createdAt, updatedAt, corect_answers, total_points)
                    values(teamID, namespace_id,current_timestamp, current_timestamp, 0, 0);
END //

DELIMITER //
Create PROCEDURE Block_namespace( IN namespace varchar(255))
BEGIN
    Update active_namespaces set is_active = 0 where namespace_identifier like namespace;
END //

DELIMITER //
Create PROCEDURE UpdateScores( IN scor INT, IN namespace varchar(255), IN team int)
BEGIN
    Update users_active_namespaces set total_points = scor
            where active_namespace_id = (select id from active_namespaces id where namespace_identifier like namespace)
            and team_id = (select users.team_id from users where users.id = team);
END //

DELIMITER //
Create PROCEDURE Get_Namespace_allocated_teams(IN namespace varchar(255))
BEGIN
    select uan.team_id from active_namespaces an join users_active_namespaces uan on an.id = uan.active_namespace_id
                                                         where namespace_identifier like namespace;
END //

DELIMITER //
Create PROCEDURE Get_Correct_Answers(IN namespace varchar(255), IN QuestionID int)
BEGIN
    select a.id as answer_id, a.answer,t.name
                            from active_namespaces an join users_active_namespaces uan on an.id = uan.active_namespace_id
                            join teams t on uan.team_id = t.id join answers_recieved ar on t.id = ar.team_id join answers a on a.id = ar.answer_id
                            where an.namespace_identifier like namespace and ar.question_id = QuestionID;
END //

DELIMITER //
Create PROCEDURE Get_Correct_Answer_Details( IN QuestionID int)
BEGIN
    select id, answer from answers where question_id = QuestionID and is_correct = 1;
END //

DELIMITER //
Create PROCEDURE Get_Admins_Namespace( IN AdminID int)
BEGIN
    Select namespace_identifier from active_namespaces where is_active = 1 and admin_id = AdminID;
END //

DELIMITER //
Create PROCEDURE Add_Admins_Namespace( IN AdminID int, IN namespace varchar(255))
BEGIN
    INSERT INTO active_namespaces(admin_id, namespace_identifier, is_active, createdAt, updatedAt)
                                 values (AdminID, namespace, 1, current_timestamp, current_timestamp);
END //

CREATE TRIGGER question_timePlayed_check BEFORE INSERT ON questions FOR EACH ROW IF NEW.times_played != 0
THEN SET NEW.times_played = 0; END IF;

CREATE TRIGGER teams_points_check BEFORE INSERT ON teams FOR EACH ROW IF NEW.total_points != 0
THEN SET NEW.total_points = 0; END IF;

CREATE TRIGGER teams_answers_check BEFORE INSERT ON teams FOR EACH ROW IF NEW.corect_answers != 0
THEN SET NEW.corect_answers = 0; END IF;

CREATE TRIGGER nsp_points_check BEFORE INSERT ON users_active_namespaces FOR EACH ROW IF NEW.total_points != 0
THEN SET NEW.total_points = 0; END IF;

CREATE TRIGGER nsp_answers_check BEFORE INSERT ON users_active_namespaces FOR EACH ROW IF NEW.corect_answers != 0
THEN SET NEW.corect_answers = 0; END IF;