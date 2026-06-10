-- Homepage left navigation MySQL seed data
-- Generates 19 banks (excluding "计算机"), 2 disciplines per bank, 40 questions per discipline.
-- Total: 19 banks, 38 disciplines, 1520 questions.
--
-- Important:
-- 1. An existing user is required. The user with the smallest id becomes the creator.
-- 2. Existing banks with the same names are reused and updated.
-- 3. Existing questions for the same bank + discipline pairs are deleted before regeneration.
-- 4. Homepage hover-panel-only banks are intentionally excluded.

SET NAMES utf8mb4;
SET @homepage_seed_creator_id = (SELECT MIN(`id`) FROM `User`);

DROP TEMPORARY TABLE IF EXISTS `_homepage_left_seed_plan`;
CREATE TEMPORARY TABLE `_homepage_left_seed_plan` (
  `category_name` VARCHAR(191) NOT NULL,
  `bank_name` VARCHAR(191) NOT NULL,
  `discipline_name` VARCHAR(191) NOT NULL,
  `topic_name` VARCHAR(191) NOT NULL
);

INSERT INTO `_homepage_left_seed_plan`
  (`category_name`, `bank_name`, `discipline_name`, `topic_name`)
VALUES
  ('考研升学', '考研数学', '高等数学', '函数、极限、微积分与常微分方程'),
  ('考研升学', '考研数学', '线性代数', '矩阵、向量、线性方程组与特征值'),
  ('考研升学', '考研英语', '阅读理解', '考研英语阅读理解与篇章分析'),
  ('考研升学', '考研英语', '翻译写作', '考研英语翻译、应用文与议论文写作'),
  ('考研升学', '教育学', '教育学原理', '教育目的、课程、教学与德育原理'),
  ('考研升学', '教育学', '教育心理学', '学习理论、认知发展与学习动机'),

  ('中小学题库', '高中数学', '函数与导数', '高中函数、导数及其应用'),
  ('中小学题库', '高中数学', '立体几何', '空间几何体、直线与平面'),
  ('中小学题库', '高中物理', '力学', '运动、力、能量与动量'),
  ('中小学题库', '高中物理', '电磁学', '电场、电路、磁场与电磁感应'),
  ('中小学题库', '初中英语', '语法基础', '初中英语词法、句法与时态'),
  ('中小学题库', '初中英语', '阅读与词汇', '初中英语核心词汇与阅读理解'),
  ('中小学题库', '小学语文', '字词基础', '小学语文字音、字形与词语运用'),
  ('中小学题库', '小学语文', '阅读表达', '小学语文阅读理解与表达'),

  ('IT 与互联网', 'Java', 'Java 基础', 'Java 语法、面向对象与异常处理'),
  ('IT 与互联网', 'Java', 'Java 集合与并发', 'Java 集合框架、线程与并发工具'),
  ('IT 与互联网', 'Python', 'Python 基础', 'Python 语法、函数、模块与面向对象'),
  ('IT 与互联网', 'Python', 'Python 数据处理', 'Python 文件、数据分析与常用库'),
  ('IT 与互联网', '前端开发', 'HTML 与 CSS', '网页结构、样式、布局与响应式设计'),
  ('IT 与互联网', '前端开发', 'JavaScript 与 Vue', 'JavaScript、浏览器与 Vue 开发'),
  ('IT 与互联网', '软考', '软件工程', '软件过程、需求、设计、测试与维护'),
  ('IT 与互联网', '软考', '计算机基础', '操作系统、网络、数据库与数据结构'),

  ('职业资格', '教师资格', '综合素质', '教师职业理念、法规、文化素养与能力'),
  ('职业资格', '教师资格', '教育知识与能力', '教育基础、学生指导与教学实施'),
  ('职业资格', '财会金融', '会计基础', '会计要素、凭证、账簿与财务报表'),
  ('职业资格', '财会金融', '金融基础', '货币、银行、证券、保险与风险管理'),
  ('职业资格', '建筑工程', '建筑工程管理', '施工组织、质量、安全与成本管理'),
  ('职业资格', '建筑工程', '工程法规', '建设工程法律制度、合同与责任'),
  ('职业资格', '医药卫生', '医学基础', '人体结构、生理、病理与临床基础'),
  ('职业资格', '医药卫生', '药学与护理', '药理、用药安全与基础护理'),

  ('公职招录', '国家公务员', '行政职业能力测验', '言语、数量、判断、资料与常识'),
  ('公职招录', '国家公务员', '申论', '材料阅读、概括、分析与文章写作'),
  ('公职招录', '事业单位', '职业能力倾向测验', '事业单位职测核心模块'),
  ('公职招录', '事业单位', '综合应用能力', '案例分析、实务处理与材料写作'),
  ('公职招录', '教师招聘', '教育理论', '教育学、心理学与教师职业规范'),
  ('公职招录', '教师招聘', '学科教学', '课程标准、教学设计与课堂评价'),
  ('公职招录', '军队文职', '公共科目', '基本知识与岗位能力'),
  ('公职招录', '军队文职', '岗位能力', '言语理解、数量关系与判断推理');

DELIMITER $$

DROP PROCEDURE IF EXISTS `seed_homepage_left_banks`$$
CREATE PROCEDURE `seed_homepage_left_banks`()
BEGIN
  DECLARE finished INT DEFAULT 0;
  DECLARE question_no INT DEFAULT 0;
  DECLARE category_id INT;
  DECLARE bank_id INT;
  DECLARE discipline_id INT;
  DECLARE question_id INT;
  DECLARE category_name VARCHAR(191);
  DECLARE bank_name VARCHAR(191);
  DECLARE discipline_name VARCHAR(191);
  DECLARE topic_name VARCHAR(191);
  DECLARE question_type VARCHAR(32);

  DECLARE seed_cursor CURSOR FOR
    SELECT `category_name`, `bank_name`, `discipline_name`, `topic_name`
    FROM `_homepage_left_seed_plan`
    ORDER BY `category_name`, `bank_name`, `discipline_name`;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;

  IF @homepage_seed_creator_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Homepage seed requires at least one existing user.';
  END IF;

  OPEN seed_cursor;

  seed_loop: LOOP
    FETCH seed_cursor INTO category_name, bank_name, discipline_name, topic_name;
    IF finished = 1 THEN
      LEAVE seed_loop;
    END IF;

    INSERT INTO `BankCategory` (`name`)
    VALUES (category_name)
    ON DUPLICATE KEY UPDATE `id` = LAST_INSERT_ID(`id`);
    SET category_id = LAST_INSERT_ID();

    INSERT INTO `Bank` (`name`, `description`, `creatorId`, `categoryId`)
    VALUES (
      bank_name,
      CONCAT(bank_name, '公开练习题库，覆盖', topic_name, '。'),
      @homepage_seed_creator_id,
      category_id
    )
    ON DUPLICATE KEY UPDATE
      `id` = LAST_INSERT_ID(`id`),
      `description` = VALUES(`description`),
      `categoryId` = VALUES(`categoryId`);
    SET bank_id = LAST_INSERT_ID();

    INSERT INTO `Discipline` (`name`)
    VALUES (discipline_name)
    ON DUPLICATE KEY UPDATE `id` = LAST_INSERT_ID(`id`);
    SET discipline_id = LAST_INSERT_ID();

    INSERT IGNORE INTO `_BankToDiscipline` (`A`, `B`)
    VALUES (bank_id, discipline_id);

    DELETE FROM `Question`
    WHERE `bankId` = bank_id AND `disciplineId` = discipline_id;

    SET question_no = 1;
    WHILE question_no <= 40 DO
      SET question_type = CASE
        WHEN question_no <= 24 THEN 'SingleChoice'
        WHEN question_no <= 32 THEN 'MultiChoice'
        WHEN question_no <= 38 THEN 'TrueFalse'
        ELSE 'Subjective'
      END;

      INSERT INTO `Question`
        (`type`, `content`, `bankId`, `disciplineId`, `riskLevel`, `explanation`)
      VALUES (
        question_type,
        CASE question_type
          WHEN 'SingleChoice' THEN CONCAT('【', discipline_name, '】基础单选题 ', question_no, '：关于', topic_name, '，下列说法正确的是？')
          WHEN 'MultiChoice' THEN CONCAT('【', discipline_name, '】综合多选题 ', question_no, '：关于', topic_name, '，下列说法正确的有？')
          WHEN 'TrueFalse' THEN CONCAT('【', discipline_name, '】判断题 ', question_no, '：掌握', topic_name, '需要理解概念并结合实际应用。')
          ELSE CONCAT('【', discipline_name, '】主观题 ', question_no, '：请概述', topic_name, '的核心知识，并举例说明其应用。')
        END,
        bank_id,
        discipline_id,
        MOD(question_no - 1, 3) + 1,
        CONCAT('本题用于检查对“', topic_name, '”核心知识的理解。')
      );
      SET question_id = LAST_INSERT_ID();

      IF question_type = 'SingleChoice' THEN
        INSERT INTO `Option` (`key`, `text`, `questionId`) VALUES
          ('A', CONCAT('能够准确描述', topic_name, '的核心规律'), question_id),
          ('B', CONCAT('完全忽略', topic_name, '的适用条件'), question_id),
          ('C', CONCAT('认为', topic_name, '与实际问题无关'), question_id),
          ('D', CONCAT('用单一结论代替', topic_name, '的全部内容'), question_id);
        INSERT INTO `SingleAnswer` (`questionId`, `answerKey`)
        VALUES (question_id, 'A');

      ELSEIF question_type = 'MultiChoice' THEN
        INSERT INTO `Option` (`key`, `text`, `questionId`) VALUES
          ('A', CONCAT('理解', topic_name, '的基本概念'), question_id),
          ('B', CONCAT('分析', topic_name, '的适用场景'), question_id),
          ('C', CONCAT('结合案例运用', topic_name), question_id),
          ('D', CONCAT('忽略', topic_name, '的前提条件'), question_id);
        INSERT INTO `MultiChoiceAnswer` (`questionId`, `answerKey`) VALUES
          (question_id, 'A'),
          (question_id, 'B'),
          (question_id, 'C');

      ELSEIF question_type = 'TrueFalse' THEN
        INSERT INTO `Option` (`key`, `text`, `questionId`) VALUES
          ('A', '正确', question_id),
          ('B', '错误', question_id);
        INSERT INTO `TrueFalseAnswer` (`questionId`, `answerKey`)
        VALUES (question_id, 'A');

      ELSE
        INSERT INTO `SubjectiveAnswer` (`questionId`, `reference`)
        VALUES (
          question_id,
          CONCAT(
            '参考答案应包含“', topic_name,
            '”的基本概念、关键规律、适用条件和实际案例，并做到结构清晰、论证完整。'
          )
        );
      END IF;

      SET question_no = question_no + 1;
    END WHILE;
  END LOOP;

  CLOSE seed_cursor;
END$$

CALL `seed_homepage_left_banks`()$$
DROP PROCEDURE `seed_homepage_left_banks`$$

DELIMITER ;

DROP TEMPORARY TABLE `_homepage_left_seed_plan`;

-- Validation: each row should report 40 questions.
SELECT
  b.`name` AS `Bank`,
  d.`name` AS `Discipline`,
  COUNT(q.`id`) AS `question_count`
FROM `Bank` b
JOIN `_BankToDiscipline` bd ON bd.`A` = b.`id`
JOIN `Discipline` d ON d.`id` = bd.`B`
LEFT JOIN `Question` q ON q.`bankId` = b.`id` AND q.`disciplineId` = d.`id`
WHERE b.`name` IN (
  '考研数学', '考研英语', '教育学',
  '高中数学', '高中物理', '初中英语', '小学语文',
  'Java', 'Python', '前端开发', '软考',
  '教师资格', '财会金融', '建筑工程', '医药卫生',
  '国家公务员', '事业单位', '教师招聘', '军队文职'
)
GROUP BY b.`id`, b.`name`, d.`id`, d.`name`
ORDER BY b.`id`, d.`id`;

