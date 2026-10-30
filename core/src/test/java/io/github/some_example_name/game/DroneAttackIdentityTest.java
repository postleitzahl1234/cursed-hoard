package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class DroneAttackIdentityTest {
    @Test
    void everyGoblinDroneTowerHasADistinctFlightAndStrikeProfile() {
        TowerType[] types = {TowerType.DRONE_BAY, TowerType.DRONE_SWARM, TowerType.DRONE_FOUNDRY,
                TowerType.SKY_CARRIER, TowerType.BOMBER_DRONE, TowerType.CARPET_BOMBER};
        World world = new World();
        Hero target = world.spawnHero(HeroType.PEASANT);
        Set<String> profiles = new HashSet<>();
        for (TowerType type : types) {
            DroneActor drone = new DroneActor(new Tower(type, 0, 0), target);
            String profile = drone.cruiseSpeed(SkillTreeBonus.empty()) + ":" + drone.strikeCount()
                    + ":" + drone.strikeRadius() + ":" + drone.attackInterval();
            assertTrue(profiles.add(profile), type + " duplicates another drone attack profile");
        }
    }
}
