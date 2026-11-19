package com.saasfinanceiro.finexp.gamification;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class LevelCalculatorTest {

    @Test
    void eachLevelCostsOneHundredXpMoreThanThePreviousOne() {
        assertEquals(0, LevelCalculator.xpForLevel(1));
        assertEquals(100, LevelCalculator.xpForLevel(2));
        assertEquals(300, LevelCalculator.xpForLevel(3));
        assertEquals(600, LevelCalculator.xpForLevel(4));
    }

    @Test
    void levelChangesExactlyAtTheThreshold() {
        assertEquals(1, LevelCalculator.levelFor(0));
        assertEquals(1, LevelCalculator.levelFor(99));
        assertEquals(2, LevelCalculator.levelFor(100));
        assertEquals(2, LevelCalculator.levelFor(299));
        assertEquals(3, LevelCalculator.levelFor(300));
    }

    @Test
    void titleChangesEveryFiveLevels() {
        assertEquals("Beginner", LevelCalculator.titleFor(1));
        assertEquals("Beginner", LevelCalculator.titleFor(4));
        assertEquals("Organized", LevelCalculator.titleFor(5));
        assertEquals("Saver", LevelCalculator.titleFor(10));
        assertEquals("Strategist", LevelCalculator.titleFor(15));
        assertEquals("Finance Master", LevelCalculator.titleFor(20));
    }
}
