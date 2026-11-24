package com.enterprise.examples;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class StructuredTaskPipeline {
    public record UserProfile(String id, String username) {}
    public record UserCreditScore(String id, int score) {}
    public record CombinedAccountState(UserProfile profile, UserCreditScore score) {}

    public CombinedAccountState aggregateUserData(String userId) throws Exception {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            Future<UserProfile> profileTask = executor.submit(() -> queryUserProfile(userId));
            Future<UserCreditScore> creditTask = executor.submit(() -> queryCreditScore(userId));

            return new CombinedAccountState(profileTask.resultNow(), creditTask.resultNow());
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
