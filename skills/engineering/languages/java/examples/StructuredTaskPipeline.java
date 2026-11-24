package com.enterprise.examples;

import java.util.concurrent.StructuredTaskScope;
import java.util.function.Supplier;

public class StructuredTaskPipeline {
    public record UserProfile(String id, String username) {}
    public record UserCreditScore(String id, int score) {}
    public record CombinedAccountState(UserProfile profile, UserCreditScore score) {}

    public CombinedAccountState aggregateUserData(String userId) throws Exception {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            Supplier<UserProfile> profileSubtask = scope.fork(() -> queryUserProfile(userId));
            Supplier<UserCreditScore> creditSubtask = scope.fork(() -> queryCreditScore(userId));

            scope.join();
            scope.throwIfFailed();

            return new CombinedAccountState(profileSubtask.get(), creditSubtask.get());
        }
    }

    private UserProfile queryUserProfile(String userId) throws InterruptedException {
        Thread.sleep(50);
        return new UserProfile(userId, "engineer_user");
    }

    private UserCreditScore queryCreditScore(String userId) throws InterruptedException {
        Thread.sleep(70);
        return new UserCreditScore(userId, 810);
    }
}
