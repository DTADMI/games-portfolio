package com.games.backend.graphql;

import com.games.backend.model.GameScore;
import com.games.backend.repository.GameScoreRepository;
import com.games.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class QueryResolver {
    private final GameScoreRepository gameScoreRepository;
    private final UserRepository userRepository;

  @QueryMapping
  public List<GameScore> gameScores(
    @Argument String gameType,
    @Argument Integer limit) {
        Pageable pageable = limit != null ?
                PageRequest.of(0, limit, Sort.by("score").descending()) :
                Pageable.unpaged();
    return gameScoreRepository.findTopScoresByGameType(gameType, pageable);
    }
}
