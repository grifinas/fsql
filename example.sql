SELECT log.entries FROM ./data/sprint1.har 
    >> SELECT _webSocketMessages from $0 
    >> SELECT * FROM $0 WHERE type=receive


SELECT log.pages FROM ./data/sprint1.har INTO $pages
SELECT log.entries FROM ./data/sprint1.har INTO $entries
SELECT FLAT(_webSocketMessages) from $entries INTO $ws
SELECT JSON(data) FROM $ws WHERE type=receive INTO $wsdata
SELECT * from $wsdata JOIN $pages


SELECT entries[]._webSocketMessages 
    FROM ./data/sprint1.har 
    WHERE entries[]._webSocketMessages.type=receive