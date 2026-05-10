<?php

$QUESTS_CONFIG = [
    'hourly' => [
        'hourly_1' => ['id' => 'hourly_1', 'title' => 'Hourly Login Bonus', 'desc' => 'Log in to claim your hourly free Yen!', 'reward' => 50],
        'hourly_2' => ['id' => 'hourly_2', 'title' => 'Hourly Knowledge Check', 'desc' => 'Play any 1 quiz.', 'reward' => 60, 'requirement' => ['type' => 'play_quiz', 'count' => 1]],
        'hourly_3' => ['id' => 'hourly_3', 'title' => 'Speedy Scholar', 'desc' => 'Play 2 quizzes.', 'reward' => 70, 'requirement' => ['type' => 'play_quiz', 'count' => 2]],
        'hourly_4' => ['id' => 'hourly_4', 'title' => 'General Trivia Addict', 'desc' => 'Play a General Knowledge quiz.', 'reward' => 80, 'requirement' => ['type' => 'play_category', 'category_id' => 9, 'count' => 1]],
        'hourly_5' => ['id' => 'hourly_5', 'title' => 'The Hourly Master', 'desc' => 'Play an Anime & Manga quiz.', 'reward' => 100, 'requirement' => ['type' => 'play_category', 'category_id' => 31, 'count' => 1]],
    ],
    'daily' => [
        'daily_1' => ['id' => 'daily_1', 'title' => 'Daily Dedication', 'desc' => 'Log in today to claim your daily bonus.', 'reward' => 200],
        'daily_2' => ['id' => 'daily_2', 'title' => 'Persistent Player', 'desc' => 'Play any 3 quizzes.', 'reward' => 250, 'requirement' => ['type' => 'play_quiz', 'count' => 3]],
        'daily_3' => ['id' => 'daily_3', 'title' => 'General Scholar', 'desc' => 'Play 2 General Knowledge quizzes.', 'reward' => 300, 'requirement' => ['type' => 'play_category', 'category_id' => 9, 'count' => 2]],
        'daily_4' => ['id' => 'daily_4', 'title' => 'Anime Expert', 'desc' => 'Play 2 Anime & Manga quizzes.', 'reward' => 400, 'requirement' => ['type' => 'play_category', 'category_id' => 31, 'count' => 2]],
        'daily_5' => ['id' => 'daily_5', 'title' => 'The Daily Grind', 'desc' => 'Play any 5 quizzes.', 'reward' => 500, 'requirement' => ['type' => 'play_quiz', 'count' => 5]],
    ],
    'weekly' => [
        'weekly_1' => ['id' => 'weekly_1', 'title' => 'Weekend Warrior', 'desc' => 'Log in this week for a massive boost.', 'reward' => 1000],
        'weekly_2' => ['id' => 'weekly_2', 'title' => 'Seven Days of Wisdom', 'desc' => 'Play any 10 quizzes.', 'reward' => 1200, 'requirement' => ['type' => 'play_quiz', 'count' => 10]],
        'weekly_3' => ['id' => 'weekly_3', 'title' => 'General Master', 'desc' => 'Play 5 General Knowledge quizzes.', 'reward' => 1500, 'requirement' => ['type' => 'play_category', 'category_id' => 9, 'count' => 5]],
        'weekly_4' => ['id' => 'weekly_4', 'title' => 'True Otaku', 'desc' => 'Play 5 Anime & Manga quizzes.', 'reward' => 2000, 'requirement' => ['type' => 'play_category', 'category_id' => 31, 'count' => 5]],
        'weekly_5' => ['id' => 'weekly_5', 'title' => 'The Weekly Marathon', 'desc' => 'Play any 20 quizzes.', 'reward' => 3000, 'requirement' => ['type' => 'play_quiz', 'count' => 20]],
    ]
];

$COOLDOWNS = [
    'hourly' => 3600,
    'daily' => 86400,
    'weekly' => 604800
];

?>
