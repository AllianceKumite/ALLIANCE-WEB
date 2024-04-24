DELIMITER $$
DROP PROCEDURE IF EXISTS alter_column$$
CREATE PROCEDURE alter_column(
    IN name_of_database varchar(64),
    IN prefix_of_table varchar(64),
    IN new_name_of_column varchar(64),
    IN type_of_new_column varchar(64),
    IN default_value int
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE name_of_table CHAR(64);
    DECLARE table_cursor CURSOR FOR
        SELECT TABLE_NAME FROM information_schema.tables
        WHERE TABLE_SCHEMA = name_of_database AND TABLE_NAME LIKE prefix_of_table;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN table_cursor;
    table_loop: LOOP
        FETCH table_cursor INTO name_of_table;
        IF done THEN LEAVE table_loop; END IF;

		IF (new_name_of_column = 'CountBall')
        THEN
            SET @alter_sql = CONCAT(
                 'ALTER TABLE ', name_of_table,
                ' MODIFY COLUMN ', new_name_of_column, ' ', type_of_new_column,
                ' DEFAULT ', default_value
             );

             PREPARE alter_statement FROM @alter_sql;
             EXECUTE alter_statement;
             DEALLOCATE PREPARE alter_statement;
        END IF;

        IF NOT EXISTS (
            SELECT * FROM information_schema.COLUMNS
            WHERE column_name=new_name_of_column
            and table_name=name_of_table
            and table_schema=name_of_database
            )
        THEN
            SET @alter_sql = CONCAT(
                'ALTER TABLE ', name_of_database, '.', name_of_table,
                ' ADD COLUMN ', new_name_of_column, ' ', type_of_new_column,
                ' DEFAULT ', default_value
            );

            PREPARE alter_statement FROM @alter_sql;
            EXECUTE alter_statement;
            DEALLOCATE PREPARE alter_statement;
        END IF;
    END LOOP;
    CLOSE table_cursor;
END $$

DELIMITER ;

CALL alter_column('karate_db', '%\_athchamp', 'Category2Id',  'int', 0);


-- -- TotalBal CountWinner CountVazary CountIppon CountRefery
-- -- Instead of TotalBal we have CountBall, but CountBall should be float (was int)
-- CALL alter_column('karate_db', '%\_athchamp', 'CountBall',  'float', 0);
-- -- CALL alter_column('karate_db', '%\_athchamp', 'CountWinner',  'int', 0);
-- CALL alter_column('karate_db', '%\_athchamp', 'CountVazary',  'int', 0);
-- CALL alter_column('karate_db', '%\_athchamp', 'CountIppon',  'int', 0);
-- CALL alter_column('karate_db', '%\_athchamp', 'CountRefery',  'int', 0);
-- -- Chu1R Chu2R Chu3R Vaz1R Vaz2R IpponR Chu1W Chu2W Chu3W Vaz1W Vaz2W IpponW
-- -- TimeRemain Refery1 Refery2 Refery3 Refery4 Refery5 Avg
-- CALL alter_column('karate_db', '%\_champ', 'Chu1R',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Chu2R',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Chu3R',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Vaz1R',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Vaz2R',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'IpponR',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Chu1W',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Chu2W',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Chu3W',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Vaz1W',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Vaz2W',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'IpponW',  'int', 0);
-- CALL alter_column('karate_db', '%\_champ', 'TimeRemain',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Refery1',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Refery2',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Refery3',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Refery4',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Refery5',  'float', 0);
-- CALL alter_column('karate_db', '%\_champ', 'Avg',  'float', 0);
-- -- TimeDuel1 TimeDuel2 TimeDuel3 TimeDuel4 TimeFDuel1 TimeFDuel2 TimeFDuel3 TimeFDuel4
-- CALL alter_column('karate_db', '%\_category', 'TimeDuel1',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeDuel2',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeDuel3',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeDuel4',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeFDuel1',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeFDuel2',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeFDuel3',  'int', 0);
-- CALL alter_column('karate_db', '%\_category', 'TimeFDuel4',  'int', 0);
